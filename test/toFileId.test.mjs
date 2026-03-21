import { test } from "node:test";
import assert from "node:assert/strict";
import { toFileId } from "../dist/index.mjs";

test("extracts id from /file/d/… URL", () => {
  assert.equal(
    toFileId("https://drive.google.com/file/d/abcXYZ12_-view/view?usp=sharing"),
    "abcXYZ12_-view"
  );
});

test("returns input when it is already a bare id", () => {
  assert.equal(toFileId("1a2b3c4d5e"), "1a2b3c4d5e");
});

test("uses first /d/ segment when multiple appear", () => {
  assert.equal(toFileId("https://drive.google.com/file/d/firstId/other/d/ignored"), "firstId");
});
