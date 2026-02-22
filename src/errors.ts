/**
 * Error thrown when a Google Drive download fails (wrong status, no link, etc.).
 */
export class GDriveDownloadError extends Error {
  readonly statusCode: number | undefined;
  readonly fileId: string | undefined;

  constructor(
    message: string,
    options?: { cause?: unknown; statusCode?: number; fileId?: string }
  ) {
    super(message);
    this.name = "GDriveDownloadError";
    this.statusCode = options?.statusCode;
    this.fileId = options?.fileId;
    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
    Object.setPrototypeOf(this, GDriveDownloadError.prototype);
  }
}
