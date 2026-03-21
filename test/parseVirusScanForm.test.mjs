import { test } from "node:test";
import assert from "node:assert/strict";
import { parseVirusScanForm } from "../dist/advanced.mjs";

const virusScanLike = `
<form id="download-form" action="https://drive.usercontent.google.com/download?authuser=0" method="get">
  <input type="hidden" name="id" value="FILEID123" />
  <input type="hidden" name="export" value="download" />
  <input type="hidden" name="confirm" value="t" />
</form>`;

test("parseVirusScanForm builds confirm URL with query from hidden inputs", () => {
  const url = parseVirusScanForm(virusScanLike);
  assert.ok(url);
  assert.match(url, /^https:\/\/drive\.usercontent\.google\.com\/download\?/);
  assert.match(url, /[?&]id=FILEID123/);
  assert.match(url, /[?&]export=download/);
  assert.match(url, /[?&]confirm=t/);
});

test("parseVirusScanForm returns null without form action", () => {
  assert.equal(parseVirusScanForm("<html><div>no form</div></html>"), null);
});

test("parseVirusScanForm returns null when action exists but no inputs", () => {
  const html = '<form action="https://example.com/x"></form>';
  assert.equal(parseVirusScanForm(html), null);
});
