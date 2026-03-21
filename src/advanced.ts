/**
 * Low-level and composable APIs for custom pipelines, tests, or tooling.
 * For normal use, import from `better-gdrive` instead.
 *
 * @packageDocumentation
 */
export { fetchPublicFileResponse } from "./download/pipeline.js";
export type { PublicDownloadPipelineOptions } from "./download/pipeline.js";

export { getDownloadUrl } from "./download/downloadUrl.js";
export type { DownloadUrlOptions } from "./download/downloadUrl.js";

export { fetchDownloadResponse, parseVirusScanForm } from "./download/fetchDownload.js";
export type { FetchDownloadOptions } from "./download/fetchDownload.js";

export { isQuotaExceededHtml, throwIfQuotaExceeded } from "./download/quotaHtml.js";
