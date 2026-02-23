# better-gdrive

[![Node](https://img.shields.io/badge/node-18%20%7C%2020%20%7C%2022%20%7C%2024-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![npm](https://img.shields.io/npm/v/better-gdrive?style=flat-square)](https://www.npmjs.com/package/better-gdrive)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](./LICENSE)

Download files from **public Google Drive** without OAuth: list a folder, get a file in memory (blob/buffer), read metadata, or save directly to disk. Lightweight, no runtime dependencies, optimized (streaming, low memory).

If this package is useful to you, a **⭐ [star](https://github.com/Sn4tchZ/better-gdrive)** on the repo is always appreciated.

---

## Installation

```bash
npm install better-gdrive
```

**Requirements:** Node ≥ 18. Files or folders must be shared with "Anyone with the link".

When Google shows the **"Virus scan warning"** page for a file, the library automatically parses the confirmation form and fetches the real file—no extra step on your side.

---

## API — Tutorial by function

| [listFiles](#listfilesfolderid-options) | [getFile](#getfilefileid-format-options) | [getFileMetadata](#getfilemetadatafileid-options) | [downloadFile](#downloadfilefileid-path-options) | [toFileId](#tofileidinput) |
|----------------------------------------|----------------------------------------|--------------------------------------------------|--------------------------------------------------|---------------------------|

All functions that take a file accept either an **ID** (e.g. `abc123xyz`) or a **share link** (the ID is extracted automatically). Cancellation is supported via `{ signal: AbortSignal }` on every call.

---

### `listFiles(folderId, options?)`

Lists files in a **public folder** (share link or folder ID).

**Returns:** `Promise<ListFileEntry[]>` with `{ id: string, name?: string }` (name is set when Drive’s HTML provides it).

```js
import { listFiles } from "better-gdrive";

const files = await listFiles("https://drive.google.com/drive/folders/1ABC...");
// or
const files = await listFiles("1ABC...");

console.log(files);
// [{ id: "xyz123", name: "report.pdf" }, { id: "abc456", name: "data.csv" }, ...]
```

---

### `getFile(fileId, format, options?)`

Gets the file **in memory** as a `Blob` (browser or Node) or `Buffer` (Node).

- **format:** `"blob"` | `"buffer"`

```js
import { getFile } from "better-gdrive";

// As buffer (Node)
const buffer = await getFile("FILE_ID", "buffer");
fs.writeFileSync("./out.pdf", buffer);

// As blob (Node or browser)
const blob = await getFile("FILE_ID", "blob");
const url = URL.createObjectURL(blob);
```

---

### `getFileMetadata(fileId, options?)`

Gets **metadata** without downloading the file (HEAD / minimal Range request).

**Returns:** `Promise<FileMetadata>` with `filename?`, `size?`, `mimeType?`, `lastModified?` (Date).

```js
import { getFileMetadata } from "better-gdrive";

const meta = await getFileMetadata("FILE_ID");
console.log(meta.filename);   // "document.pdf"
console.log(meta.size);       // 1024000
console.log(meta.lastModified); // Date
```

---

### `downloadFile(fileId, path, options?)`

Saves the file **directly to disk** (Node only). Uses streaming to limit memory usage.

```js
import { downloadFile } from "better-gdrive";

await downloadFile("FILE_ID", "./downloads/document.pdf");
```

---

### `toFileId(input)`

Extracts the **Drive ID** from a share link, or returns the string as-is if it’s already an ID.

```js
import { toFileId } from "better-gdrive";

const id = toFileId("https://drive.google.com/file/d/1abcXYZ/view?usp=sharing");
// "1abcXYZ"
```

---

### Errors: `GDriveDownloadError`

On failure (bad HTTP status, no download link, etc.), the package throws **`GDriveDownloadError`** (subclass of `Error`) with:

- **message**
- **statusCode** (optional)
- **fileId** (optional)

```js
import { getFile, GDriveDownloadError } from "better-gdrive";

try {
  const buffer = await getFile("BAD_ID", "buffer");
} catch (err) {
  if (err instanceof GDriveDownloadError) {
    console.error(err.fileId, err.statusCode);
  }
  throw err;
}
```

---

### Cancellation: `signal`

All functions that accept `options` support **`options.signal`** (AbortSignal) to cancel the request.

```js
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);

const files = await listFiles("FOLDER_ID", { signal: controller.signal });
```

---

## Exported types

- **`ListFileEntry`**: `{ id: string; name?: string }` (returned by `listFiles`)
- **`FileMetadata`**: `{ filename?; size?; mimeType?; lastModified? }` (returned by `getFileMetadata`)

---

## License

MIT
