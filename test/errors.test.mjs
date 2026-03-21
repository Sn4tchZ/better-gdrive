import { test } from "node:test";
import assert from "node:assert/strict";
import { GDriveDownloadError, isGDriveDownloadError } from "../dist/index.mjs";

test("isGDriveDownloadError is true for GDriveDownloadError", () => {
  const err = new GDriveDownloadError("x", { code: "HTTP_ERROR", statusCode: 500 });
  assert.equal(isGDriveDownloadError(err), true);
});

test("isGDriveDownloadError is false for generic Error", () => {
  assert.equal(isGDriveDownloadError(new Error("x")), false);
});

test("GDriveDownloadError exposes code, statusCode, fileId", () => {
  const err = new GDriveDownloadError("msg", {
    code: "QUOTA_EXCEEDED",
    statusCode: 200,
    fileId: "abc",
  });
  assert.equal(err.code, "QUOTA_EXCEEDED");
  assert.equal(err.statusCode, 200);
  assert.equal(err.fileId, "abc");
  assert.equal(err.name, "GDriveDownloadError");
});
