import { GDriveDownloadError } from "./errors.js";

const FILE_ID_REGEX = /\/d\/([a-zA-Z0-9_-]+)(?:\/|$)/;

/** Normalizes share link to file ID, or returns input if already an ID. */
export function toFileId(input: string): string {
  const m = input.match(FILE_ID_REGEX);
  return m ? m[1] : input;
}

/** Resolves direct download URL for a public file by ID. */
export async function getDownloadUrl(
  fileId: string,
  signal?: AbortSignal
): Promise<string> {
  const id = toFileId(fileId);
  const res = await fetch(
    `https://drive.google.com/uc?id=${encodeURIComponent(id)}&export=download`,
    { redirect: "manual", signal }
  );
  if (res.status === 303) {
    const loc = res.headers.get("Location");
    if (loc) return loc;
    throw new GDriveDownloadError("303 without Location", { statusCode: 303, fileId: id });
  }
  if (res.status === 200) {
    const action = (await res.text()).match(/action="([^"]+)"/)?.[1];
    if (action) return action;
    throw new GDriveDownloadError("200 without form action", { statusCode: 200, fileId: id });
  }
  throw new GDriveDownloadError(`Unexpected status ${res.status}`, { statusCode: res.status, fileId: id });
}
