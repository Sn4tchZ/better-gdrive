import { GDriveDownloadError } from "../errors.js";

/**
 * Returns true when the HTML body is Google's "download quota exceeded" page
 * (too many viewers/downloads for a shared file).
 */
export function isQuotaExceededHtml(html: string): boolean {
  return (
    /<title>\s*Google Drive - Quota exceeded\s*<\/title>/i.test(html) ||
    (html.includes("uc-error-caption") &&
      (html.includes("can't view or download") ||
        html.includes("can&#39;t view or download")))
  );
}

/**
 * Throws {@link GDriveDownloadError} with message `quota exceeded` when the HTML
 * is a quota page; no-op otherwise.
 */
export function throwIfQuotaExceeded(
  html: string,
  options?: { fileId?: string }
): void {
  if (!isQuotaExceededHtml(html)) return;
  throw new GDriveDownloadError("quota exceeded", {
    code: "QUOTA_EXCEEDED",
    statusCode: 200,
    fileId: options?.fileId,
  });
}
