import { test } from "node:test";
import assert from "node:assert/strict";
import { isQuotaExceededHtml, throwIfQuotaExceeded } from "../dist/advanced.mjs";

const quotaPageSample = `<!DOCTYPE html><html><head><title>Google Drive - Quota exceeded</title></head><body>
<div class="uc-error-caption">Sorry, you can&#39;t view or download this file at this time.</div></body></html>`;

test("isQuotaExceededHtml is true for Drive quota page (title)", () => {
  assert.equal(isQuotaExceededHtml("<html><head><title>Google Drive - Quota exceeded</title></head></html>"), true);
});

test("isQuotaExceededHtml is true for uc-error-caption variant", () => {
  assert.equal(isQuotaExceededHtml(quotaPageSample), true);
});

test("isQuotaExceededHtml is false for unrelated HTML", () => {
  assert.equal(isQuotaExceededHtml("<html><body>ok</body></html>"), false);
});

test("throwIfQuotaExceeded throws QUOTA_EXCEEDED with fileId", () => {
  assert.throws(
    () => throwIfQuotaExceeded(quotaPageSample, { fileId: "fid1" }),
    (err) =>
      err &&
      err.code === "QUOTA_EXCEEDED" &&
      err.fileId === "fid1" &&
      err.statusCode === 200
  );
});

test("throwIfQuotaExceeded is no-op when not quota HTML", () => {
  assert.doesNotThrow(() => throwIfQuotaExceeded("<html></html>"));
});
