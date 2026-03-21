import type { FetchLike } from "./http.js";
import { GDriveDownloadError } from "./errors.js";
import { fetchPublicFileResponse } from "./download/pipeline.js";
import { toFileId } from "./download/toFileId.js";
import { getMetadataFromResponse } from "./metadata.js";
import { listFiles as listFilesInFolder } from "./list.js";

/**
 * Options for {@link listFiles}, {@link getFile}, {@link getFileMetadata}, and {@link downloadFile}.
 */
export interface CommonOptions {
  /** Cancels in-flight work when aborted. */
  signal?: AbortSignal;
  /** Override global `fetch` (tests, proxies). Defaults to {@link globalThis.fetch}. */
  fetch?: FetchLike;
}

function assertOkResponse(res: Response, fileId: string): void {
  if (res.ok) return;
  throw new GDriveDownloadError(`HTTP ${res.status} on final response`, {
    code: "RESPONSE_NOT_OK",
    statusCode: res.status,
    fileId,
  });
}

/**
 * Lists files in a public Drive folder.
 *
 * @throws {@link GDriveDownloadError} When the folder request fails (`code`: `FOLDER_LIST_FAILED`).
 */
export async function listFiles(
  folderId: string,
  options?: CommonOptions
): Promise<import("./list.js").ListFileEntry[]> {
  return listFilesInFolder(folderId, options);
}

/**
 * Downloads a public file into memory as a `Blob` or `Buffer`.
 *
 * @throws {@link GDriveDownloadError} On Drive-side failures (quota, missing link, bad HTTP, etc.).
 *   Inspect `err.code` (see exported type `GDriveDownloadErrorCode`) and optional `err.fileId`, `err.statusCode`.
 */
export async function getFile(
  fileId: string,
  format: "blob" | "buffer",
  options?: CommonOptions
): Promise<Blob | Buffer> {
  const id = toFileId(fileId);
  const res = await fetchPublicFileResponse(fileId, options);
  assertOkResponse(res, id);
  if (format === "buffer") return Buffer.from(await res.arrayBuffer());
  return res.blob();
}

/**
 * Reads file metadata from response headers without consuming the full body as a download.
 *
 * @throws {@link GDriveDownloadError} Same contract as {@link getFile}.
 */
export async function getFileMetadata(
  fileId: string,
  options?: CommonOptions
): Promise<import("./metadata.js").FileMetadata> {
  const id = toFileId(fileId);
  const res = await fetchPublicFileResponse(fileId, options);
  assertOkResponse(res, id);
  try {
    return getMetadataFromResponse(res);
  } finally {
    res.body?.cancel?.();
  }
}

/**
 * Streams a public file to disk (Node).
 *
 * @throws {@link GDriveDownloadError} Same contract as {@link getFile}, plus `NO_RESPONSE_BODY` if the stream is missing.
 */
export async function downloadFile(
  fileId: string,
  path: string,
  options?: CommonOptions
): Promise<void> {
  const id = toFileId(fileId);
  const res = await fetchPublicFileResponse(fileId, options);
  assertOkResponse(res, id);
  if (res.body == null) {
    throw new GDriveDownloadError("Response has no body", {
      code: "NO_RESPONSE_BODY",
      statusCode: res.status,
      fileId: id,
    });
  }
  const { Readable } = await import("node:stream");
  const { createWriteStream } = await import("node:fs");
  const { pipeline } = await import("node:stream/promises");
  const nodeReadable = Readable.fromWeb(res.body as Parameters<typeof Readable.fromWeb>[0]);
  const dest = createWriteStream(path);
  await pipeline(nodeReadable, dest);
}
