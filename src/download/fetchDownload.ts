import type { FetchLike } from "../http.js";
import { GDriveDownloadError } from "../errors.js";
import { throwIfQuotaExceeded } from "./quotaHtml.js";

export interface FetchDownloadOptions {
  signal?: AbortSignal;
  fetch?: FetchLike;
  /** Resolved file id (for error context). */
  fileId?: string;
}

/**
 * Parses the Google Drive "Virus scan warning" form and returns the GET URL
 * with all query params (action + id, export, confirm, uuid, etc.).
 * Returns null if the form cannot be parsed.
 */
export function parseVirusScanForm(html: string): string | null {
  const actionMatch = html.match(/action=["']([^"']+)["']/i);
  if (!actionMatch) return null;
  const action = actionMatch[1].trim();
  const params = new URLSearchParams();

  const inputRegex = /<input[^>]+>/gi;
  let match: RegExpExecArray | null;
  while ((match = inputRegex.exec(html)) !== null) {
    const tag = match[0];
    const nameMatch = tag.match(/name=["']([^"']+)["']/i);
    const valueMatch = tag.match(/value=["']([^"']*)["']/i);
    if (nameMatch && valueMatch) params.set(nameMatch[1], valueMatch[1]);
  }

  if (params.size === 0) return null;
  const query = params.toString();
  return query ? `${action.replace(/\?$/, "")}?${query}` : action;
}

function isHtmlResponse(res: Response, bodyStart: string): boolean {
  const ct = res.headers.get("Content-Type") ?? "";
  if (ct.includes("text/html")) return true;
  const trimmed = bodyStart.trimStart();
  return trimmed.startsWith("<!") || trimmed.startsWith("<!DOCTYPE");
}

/**
 * Fetches the download URL; if the response is the "Virus scan warning" page (200 HTML),
 * parses the form and fetches the confirmation URL, then returns the final response.
 */
export async function fetchDownloadResponse(
  url: string,
  options?: FetchDownloadOptions
): Promise<Response> {
  const fetchFn = options?.fetch ?? globalThis.fetch;
  const res = await fetchFn(url, { redirect: "manual", signal: options?.signal });
  if (res.status === 303) {
    const loc = res.headers.get("Location");
    if (loc) return fetchDownloadResponse(loc, options);
    throw new GDriveDownloadError("303 without Location", {
      code: "REDIRECT_WITHOUT_LOCATION",
      statusCode: 303,
      fileId: options?.fileId,
    });
  }
  if (res.status !== 200) {
    throw new GDriveDownloadError(`HTTP ${res.status} while downloading`, {
      code: "HTTP_ERROR",
      statusCode: res.status,
      fileId: options?.fileId,
    });
  }
  const text = await res.text();
  if (!isHtmlResponse(res, text.slice(0, 100))) {
    return new Response(text, { status: res.status, headers: res.headers });
  }
  throwIfQuotaExceeded(text);
  const confirmUrl = parseVirusScanForm(text);
  if (!confirmUrl) {
    return new Response(text, { status: res.status, headers: res.headers });
  }
  const confirmRes = await fetchFn(confirmUrl, { redirect: "follow", signal: options?.signal });
  if (!confirmRes.ok) {
    throw new GDriveDownloadError(`Virus-scan confirm failed: HTTP ${confirmRes.status}`, {
      code: "CONFIRM_FETCH_FAILED",
      statusCode: confirmRes.status,
      fileId: options?.fileId,
    });
  }
  const confirmCt = confirmRes.headers.get("Content-Type") ?? "";
  if (confirmCt.includes("text/html")) {
    const confirmText = await confirmRes.text();
    throwIfQuotaExceeded(confirmText);
    return new Response(confirmText, {
      status: confirmRes.status,
      headers: confirmRes.headers,
    });
  }
  return confirmRes;
}
