import { test } from "node:test";
import assert from "node:assert/strict";
import { getDownloadUrl } from "../dist/advanced.mjs";

test("returns Location URL on 303", async () => {
  const fetch = async (url, opts) => {
    assert.match(String(url), /drive\.google\.com\/uc\?.*id=abc123/);
    assert.equal(opts.redirect, "manual");
    return new Response(null, {
      status: 303,
      headers: { Location: "https://doc-14-20-docs.googleusercontent.com/uc?export=download" },
    });
  };
  const url = await getDownloadUrl("abc123", { fetch });
  assert.equal(url, "https://doc-14-20-docs.googleusercontent.com/uc?export=download");
});

test("returns first action URL from 200 virus-scan style HTML", async () => {
  const html = '<form action="https://confirm.example/uc?"><input name="id" value="x"></form>';
  const fetch = async () => new Response(html, { status: 200 });
  const url = await getDownloadUrl("abc", { fetch });
  assert.equal(url, "https://confirm.example/uc?");
});

test("throws QUOTA_EXCEEDED on quota HTML", async () => {
  const html = "<title>Google Drive - Quota exceeded</title>";
  const fetch = async () => new Response(html, { status: 200 });
  await assert.rejects(getDownloadUrl("abc", { fetch }), (err) => {
    return err && err.code === "QUOTA_EXCEEDED";
  });
});

test("throws NO_DOWNLOAD_FORM when 200 has no action link", async () => {
  const fetch = async () => new Response("<html>empty</html>", { status: 200 });
  await assert.rejects(getDownloadUrl("abc", { fetch }), (err) => {
    return err && err.code === "NO_DOWNLOAD_FORM";
  });
});

test("throws UNEXPECTED_UC_RESPONSE for non-303 non-200", async () => {
  const fetch = async () => new Response(null, { status: 404 });
  await assert.rejects(getDownloadUrl("abc", { fetch }), (err) => {
    return err && err.code === "UNEXPECTED_UC_RESPONSE" && err.statusCode === 404;
  });
});
