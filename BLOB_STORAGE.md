## Blob storage uploads

This project now uploads optimized tour images to an external blob (S3-compatible) instead of keeping them on disk. To configure it:

1. Provide these environment variables (Vercel Dashboard → Environment Variables):
   - `BLOB_PROJECT_ID` (project ID from Vercel Blob integration)
   - `BLOB_READ_WRITE_TOKEN` (token that Vercel shows after creating the storage)

2. The upload API (`POST /api/upload`) validates the file, optimizes it with `sharp`, stores a local copy for debug, and pushes it to Vercel Blob via `@vercel/blob`. The response includes `url` (public image URL) and `blobUrl`.

3. Use the returned `url` in the tour creation flows; the admin interface and customer UI will show the image directly from the blob.

4. If the Blob settings are missing, uploads still fall back to `public/uploads` so nothing rompe la subida.

5. The `@vercel/blob` SDK uses the `BLOB_READ_WRITE_TOKEN` that you generated in the Vercel dashboard. Make sure the token has read/write permissions.
