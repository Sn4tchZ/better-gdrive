import type { FetchLike } from "../http.js";
import { fetchDownloadResponse } from "./fetchDownload.js";
import { getDownloadUrl } from "./downloadUrl.js";
import { toFileId } from "./toFileId.js";

/** Options for the public-file download HTTP pipeline (URL resolution + fetch / virus-scan). */
export interface PublicDownloadPipelineOptions {
  signal?: AbortSignal;
  fetch?: FetchLike;
}

/**
 * Runs the full public-file download HTTP flow: resolve `uc?export=download`
 * (redirects, intermediate HTML), then follow virus-scan confirmation so the
 * returned `Response` body is the file bytes.
 */
export async function fetchPublicFileResponse(
  fileId: string,
  options?: PublicDownloadPipelineOptions
): Promise<Response> {
  const url = await getDownloadUrl(fileId, options);
  const id = toFileId(fileId);
  return fetchDownloadResponse(url, { ...options, fileId: id });
}
