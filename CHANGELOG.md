# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] — 2026-03-21

### Added

- **`better-gdrive/advanced`** subpath export for low-level APIs: `fetchPublicFileResponse`, `getDownloadUrl`, `fetchDownloadResponse`, `parseVirusScanForm`, `isQuotaExceededHtml`, `throwIfQuotaExceeded`, and related option types.
- **`GDriveDownloadErrorCode`** stable string codes on **`GDriveDownloadError`** (`code` field); prefer branching on `code` instead of `message`.
- **`isGDriveDownloadError()`** type guard.
- **`FetchLike`** and optional **`fetch`** on **`CommonOptions`** (and list options) to inject `globalThis.fetch` for tests or proxies.
- **Quota exceeded** handling: detect Google’s quota HTML page and throw `QUOTA_EXCEEDED`.
- **`ListFilesOptions`** exported from the main entry (aligned with folder listing).
- **`npm test`**: Node’s built-in test runner (`node:test`) against built `dist/` output.
- **`sideEffects: false`** in `package.json` for better tree-shaking.

### Changed

- **Breaking — `GDriveDownloadError`**: constructor now **requires** an options object with **`code: GDriveDownloadErrorCode`** (and optional `statusCode`, `fileId`, `cause`). Callers that instantiated the error manually must be updated.
- Internal layout: `src/download/` (`downloadUrl`, `fetchDownload`, `quotaHtml`, `pipeline`, `toFileId`), `src/api.ts` for high-level functions, `src/public.ts` as the documented public surface; root `src/index.ts` re-exports from `public.ts`.
- **`getDownloadUrl` + `fetchDownloadResponse`** pipeline centralized in **`fetchPublicFileResponse`** (used by `getFile`, `getFileMetadata`, `downloadFile`).
- **`listFiles`**: failed folder fetch or non-OK response throws **`GDriveDownloadError`** with `FOLDER_LIST_FAILED` instead of only raw `fetch` errors in some cases.
- README: public vs `advanced`, errors, unit tests, exported types.

[Unreleased]: https://github.com/Sn4tchZ/better-gdrive/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/Sn4tchZ/better-gdrive/compare/v0.1.2...v0.2.0
