/**
 * Stable machine-readable reason for {@link GDriveDownloadError}.
 * Prefer branching on `code` instead of `message`.
 */
export type GDriveDownloadErrorCode =
  | "QUOTA_EXCEEDED"
  | "NO_DOWNLOAD_FORM"
  | "REDIRECT_WITHOUT_LOCATION"
  | "UNEXPECTED_UC_RESPONSE"
  | "HTTP_ERROR"
  | "CONFIRM_FETCH_FAILED"
  | "RESPONSE_NOT_OK"
  | "NO_RESPONSE_BODY"
  | "FOLDER_LIST_FAILED";

/**
 * Error thrown when a Google Drive public download or folder listing fails.
 *
 * @see {@link GDriveDownloadErrorCode} — use `err.code` for programmatic handling.
 */
export class GDriveDownloadError extends Error {
  readonly code: GDriveDownloadErrorCode;
  readonly statusCode: number | undefined;
  readonly fileId: string | undefined;

  constructor(
    message: string,
    options: {
      code: GDriveDownloadErrorCode;
      cause?: unknown;
      statusCode?: number;
      fileId?: string;
    }
  ) {
    super(message);
    this.name = "GDriveDownloadError";
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.fileId = options.fileId;
    if (options.cause !== undefined) {
      this.cause = options.cause;
    }
    Object.setPrototypeOf(this, GDriveDownloadError.prototype);
  }
}

/**
 * Type guard for {@link GDriveDownloadError}.
 */
export function isGDriveDownloadError(err: unknown): err is GDriveDownloadError {
  return err instanceof GDriveDownloadError;
}
