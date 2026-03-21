import type { FetchLike } from "../http.js";
import { GDriveDownloadError } from "../errors.js";
import { throwIfQuotaExceeded } from "./quotaHtml.js";
import { toFileId } from "./toFileId.js";

export interface DownloadUrlOptions {
  signal?: AbortSignal;
  /** Defaults to {@link globalThis.fetch}. */
  fetch?: FetchLike;
}

/** Resolves direct download URL for a public file by ID. */
export async function getDownloadUrl(
  fileId: string,
  options?: DownloadUrlOptions
): Promise<string> {
  const fetchFn = options?.fetch ?? globalThis.fetch;
  const id = toFileId(fileId);
  const res = await fetchFn(
    `https://drive.google.com/uc?id=${encodeURIComponent(id)}&export=download`,
    { redirect: "manual", signal: options?.signal }
  );
  if (res.status === 303) {
    const loc = res.headers.get("Location");
    if (loc) return loc;
    throw new GDriveDownloadError("303 without Location", {
      code: "REDIRECT_WITHOUT_LOCATION",
      statusCode: 303,
      fileId: id,
    });
  }
  if (res.status === 200) {
    const body = await res.text();
    throwIfQuotaExceeded(body, { fileId: id });
    const action = body.match(/action="([^"]+)"/)?.[1];
    if (action) return action;
    throw new GDriveDownloadError("200 without form action", {
      code: "NO_DOWNLOAD_FORM",
      statusCode: 200,
      fileId: id,
    });
  }
  throw new GDriveDownloadError(`Unexpected status ${res.status}`, {
    code: "UNEXPECTED_UC_RESPONSE",
    statusCode: res.status,
    fileId: id,
  });
}
