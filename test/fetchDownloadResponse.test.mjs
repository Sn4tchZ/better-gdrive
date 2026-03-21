import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchDownloadResponse } from "../dist/advanced.mjs";

test("returns Response for non-HTML 200 body (direct file)", async () => {
  const fetch = async () =>
    new Response("not-html-content", {
      status: 200,
      headers: { "Content-Type": "application/octet-stream" },
    });
  const res = await fetchDownloadResponse("https://example.com/file.bin", { fetch });
  assert.equal(res.ok, true);
  assert.equal(await res.text(), "not-html-content");
});

test("follows 303 chain then returns body", async () => {
  const finalUrl = "https://cdn.example.com/file";
  let n = 0;
  const fetch = async (url) => {
    n += 1;
    if (n === 1) {
      return new Response(null, { status: 303, headers: { Location: finalUrl } });
    }
    return new Response("data", { status: 200, headers: { "Content-Type": "text/plain" } });
  };
  const res = await fetchDownloadResponse("https://start.example.com", { fetch });
  assert.equal(await res.text(), "data");
});

test("virus-scan HTML then confirm fetch returns file", async () => {
  const virusHtml = `
<form action="https://drive.usercontent.google.com/download">
  <input type="hidden" name="id" value="Z" />
  <input type="hidden" name="export" value="download" />
</form>`;
  let calls = 0;
  const fetch = async (url) => {
    calls += 1;
    if (calls === 1) {
      return new Response(virusHtml, { status: 200, headers: { "Content-Type": "text/html" } });
    }
    assert.match(String(url), /drive\.usercontent\.google\.com\/download/);
    return new Response("FILEBYTES", {
      status: 200,
      headers: { "Content-Type": "application/octet-stream" },
    });
  };
  const res = await fetchDownloadResponse("https://uc.example.com/start", { fetch, fileId: "Z" });
  assert.equal(await res.text(), "FILEBYTES");
});

test("throws HTTP_ERROR when first response not 200", async () => {
  const fetch = async () => new Response(null, { status: 502 });
  await assert.rejects(
    fetchDownloadResponse("https://x.com", { fetch }),
    (err) => err && err.code === "HTTP_ERROR" && err.statusCode === 502
  );
});

test("throws CONFIRM_FETCH_FAILED when confirm request fails", async () => {
  const virusHtml =
    '<form action="https://confirm.example/ok"><input name="a" value="b"></form>';
  let calls = 0;
  const fetch = async () => {
    calls += 1;
    if (calls === 1) {
      return new Response(virusHtml, { status: 200, headers: { "Content-Type": "text/html" } });
    }
    return new Response(null, { status: 503 });
  };
  await assert.rejects(
    fetchDownloadResponse("https://x.com", { fetch }),
    (err) => err && err.code === "CONFIRM_FETCH_FAILED"
  );
});
