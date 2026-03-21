const FILE_ID_REGEX = /\/d\/([a-zA-Z0-9_-]+)(?:\/|$)/;

/** Normalizes share link to file ID, or returns input if already an ID. */
export function toFileId(input: string): string {
  const m = input.match(FILE_ID_REGEX);
  return m ? m[1] : input;
}
