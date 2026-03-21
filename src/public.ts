/**
 * Stable public API of `better-gdrive`. Prefer importing from the package root
 * (`import { … } from "better-gdrive"`). Low-level helpers live under
 * `better-gdrive/advanced`.
 */
export {
  GDriveDownloadError,
  isGDriveDownloadError,
  type GDriveDownloadErrorCode,
} from "./errors.js";
export type { FetchLike } from "./http.js";
export { toFileId } from "./download/toFileId.js";
export type { FileMetadata } from "./metadata.js";
export type { ListFileEntry, ListFilesOptions } from "./list.js";

export {
  type CommonOptions,
  listFiles,
  getFile,
  getFileMetadata,
  downloadFile,
} from "./api.js";
