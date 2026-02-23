export interface FileMetadata {
  filename?: string;
  size?: number;
  mimeType?: string;
  lastModified?: Date;
}

function parseFilename(h: string | null): string | undefined {
  if (!h) return undefined;
  const u = h.match(/filename\*=UTF-8''([^;]+)/i);
  if (u) {
    try { return decodeURIComponent(u[1].trim()); } catch { return undefined; }
  }
  const q = h.match(/filename="([^"]+)"/);
  return q ? q[1] : undefined;
}

function parseSize(headers: Headers): number | undefined {
  const cl = headers.get("Content-Length");
  if (cl != null) { const n = parseInt(cl, 10); if (!Number.isNaN(n)) return n; }
  const cr = headers.get("Content-Range")?.match(/\/\s*(\d+)/);
  return cr ? parseInt(cr[1], 10) : undefined;
}

function headersToMetadata(headers: Headers): FileMetadata {
  const cd = headers.get("Content-Disposition");
  const lm = headers.get("Last-Modified");
  const ct = headers.get("Content-Type");
  let lastModified: Date | undefined;
  if (lm) { const d = new Date(lm); if (!Number.isNaN(d.getTime())) lastModified = d; }
  return {
    filename: parseFilename(cd),
    size: parseSize(headers),
    mimeType: ct ? ct.split(";")[0].trim() || undefined : undefined,
    lastModified,
  };
}

/** Builds FileMetadata from a Response's headers (e.g. from fetchDownloadResponse). Does not consume the body. */
export function getMetadataFromResponse(res: Response): FileMetadata {
  return headersToMetadata(res.headers);
}

export async function getMetadataFromUrl(
  url: string,
  signal?: AbortSignal
): Promise<FileMetadata> {
  const res = await fetch(url, { method: "HEAD", redirect: "follow", signal });
  const headers = res.ok ? res.headers : (res.status === 405
    ? (await fetch(url, { method: "GET", redirect: "follow", signal, headers: { Range: "bytes=0-0" } })).headers
    : new Headers());
  return headersToMetadata(headers);
}