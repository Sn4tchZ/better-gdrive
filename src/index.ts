export { GDriveDownloadError } from "./errors.js";
export { toFileId } from "./resolve.js";
export type { FileMetadata } from "./metadata.js";
export type { ListFileEntry } from "./list.js";

import { getDownloadUrl } from "./resolve.js";
import { getMetadataFromResponse } from "./metadata.js";
import { listFiles as listFilesInFolder } from "./list.js";
import { fetchDownloadResponse } from "./fetchDownload.js";

export interface CommonOptions {
  signal?: AbortSignal;
}

export async function listFiles(
  folderId: string,
  options?: CommonOptions
): Promise<import("./list.js").ListFileEntry[]> {
  return listFilesInFolder(folderId, options?.signal);
}

export async function getFile(
  fileId: string,
  format: "blob" | "buffer",
  options?: CommonOptions
): Promise<Blob | Buffer> {
  const url = await getDownloadUrl(fileId, options?.signal);
  const res = await fetchDownloadResponse(url, options?.signal);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  if (format === "buffer") return Buffer.from(await res.arrayBuffer());
  return res.blob();
}

export async function getFileMetadata(
  fileId: string,
  options?: CommonOptions
): Promise<import("./metadata.js").FileMetadata> {
  const url = await getDownloadUrl(fileId, options?.signal);
  const res = await fetchDownloadResponse(url, options?.signal);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  try {
    return getMetadataFromResponse(res);
  } finally {
    res.body?.cancel?.();
  }
}

export async function downloadFile(
  fileId: string,
  path: string,
  options?: CommonOptions
): Promise<void> {
  const url = await getDownloadUrl(fileId, options?.signal);
  const res = await fetchDownloadResponse(url, options?.signal);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  if (res.body == null) throw new Error("Response has no body");
  const { Readable } = await import("node:stream");
  const { createWriteStream } = await import("node:fs");
  const { pipeline } = await import("node:stream/promises");
  const nodeReadable = Readable.fromWeb(res.body as Parameters<typeof Readable.fromWeb>[0]);
  const dest = createWriteStream(path);
  await pipeline(nodeReadable, dest);
}