/**
 * Object-storage abstraction. The app never hardcodes local file paths for
 * content images — every image reference is a URL produced by this adapter,
 * so swapping S3 / Cloudflare R2 / Backblaze B2 later is a one-file change.
 */
export interface MediaStorageAdapter {
  /** Returns a signed URL the client can PUT/POST directly to, for uploads that skip the app server. */
  getUploadUrl(key: string, contentType: string): Promise<{ uploadUrl: string; publicUrl: string }>;
  /** Public, CDN-fronted URL for a stored object. */
  getPublicUrl(key: string): string;
  deleteObject(key: string): Promise<void>;
}

class S3CompatibleStorageAdapter implements MediaStorageAdapter {
  constructor(
    private readonly config: {
      endpoint?: string;
      region?: string;
      bucket?: string;
      cdnBaseUrl?: string;
    }
  ) {}

  async getUploadUrl(): Promise<{ uploadUrl: string; publicUrl: string }> {
    // Phase 1 stub: wire up @aws-sdk/client-s3 (or the R2/B2 equivalent)
    // once real storage credentials exist. Kept as an explicit stub rather
    // than a fake implementation so callers fail loudly, not silently.
    throw new Error(
      "MediaStorageAdapter.getUploadUrl is not implemented yet — configure MEDIA_STORAGE_* env vars and implement the signed-URL call for the chosen provider."
    );
  }

  getPublicUrl(key: string): string {
    const base = this.config.cdnBaseUrl?.replace(/\/$/, "");
    if (!base) {
      throw new Error("MEDIA_CDN_BASE_URL is not configured");
    }
    return `${base}/${key}`;
  }

  async deleteObject(): Promise<void> {
    throw new Error("MediaStorageAdapter.deleteObject is not implemented yet");
  }
}

export const mediaStorage: MediaStorageAdapter = new S3CompatibleStorageAdapter({
  endpoint: process.env.MEDIA_STORAGE_ENDPOINT,
  region: process.env.MEDIA_STORAGE_REGION,
  bucket: process.env.MEDIA_STORAGE_BUCKET,
  cdnBaseUrl: process.env.MEDIA_CDN_BASE_URL,
});

/** Basic responsive `srcset`-style size steps used across content cards/heroes. */
export const IMAGE_BREAKPOINTS = [400, 800, 1200, 1600] as const;
