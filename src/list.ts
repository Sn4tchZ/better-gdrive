const FOLDER_URL = "https://drive.google.com/drive/folders/";
const FOLDER_ID_REGEX = /\/folders\/([a-zA-Z0-9_-]+)/;
const SSK_FILE_ID = /ssk='[^']*:([a-zA-Z0-9_-]+)-0-1'/g;
/** Row with data-id and filename in data-tooltip or <strong>. */
const TR_ID_NAME = /<tr[^>]*\sdata-id="([a-zA-Z0-9_-]+)"[^>]*>[\s\S]*?(?:data-tooltip="([^"]+\.(?:csv|txt|pdf|zip|json))"|<strong[^>]*>([^<]+\.(?:csv|txt|pdf|zip|json))<\/strong>)/gi;

export interface ListFileEntry {
  id: string;
  name?: string;
}

function toFolderId(input: string): string {
  const m = input.match(FOLDER_ID_REGEX);
  return m ? m[1] : input;
}

export async function listFiles(
  folderLinkOrId: string,
  signal?: AbortSignal
): Promise<ListFileEntry[]> {
  const folderId = toFolderId(folderLinkOrId);
  const html = await (await fetch(`${FOLDER_URL}${encodeURIComponent(folderId)}`, { signal })).text();
  const idToName = new Map<string, string>();
  let tr: RegExpExecArray | null;
  TR_ID_NAME.lastIndex = 0;
  while ((tr = TR_ID_NAME.exec(html)) !== null) {
    const id = tr[1];
    const name = tr[2] || tr[3]?.trim();
    if (name && !idToName.has(id)) idToName.set(id, name);
  }
  const seen = new Set<string>();
  const out: ListFileEntry[] = [];
  let m: RegExpExecArray | null;
  SSK_FILE_ID.lastIndex = 0;
  while ((m = SSK_FILE_ID.exec(html)) !== null) {
    if (!seen.has(m[1])) {
      seen.add(m[1]);
      out.push({ id: m[1], name: idToName.get(m[1]) });
    }
  }
  return out;
}
