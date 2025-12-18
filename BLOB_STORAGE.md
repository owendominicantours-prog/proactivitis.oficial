## Blob storage uploads

This project now uploads optimized tour images to an external blob (S3-compatible) instead of keeping them on disk. To configure it:

1. Provide these environment variables (Vercel Dashboard → Environment Variables):
   - `BLOB_BUCKET`
   - `BLOB_REGION`
   - `BLOB_ACCESS_KEY_ID`
   - `BLOB_SECRET_ACCESS_KEY`
   - Optional `BLOB_ENDPOINT` (for non-AWS providers or custom domains).

2. The upload API (`POST /api/upload`) validates the file, optimizes it with `sharp`, stores a local copy for debug, and then pushes it to the blob. The response includes `url` (public image URL) and `blobUrl`.

3. Use the returned `url` in the tour creation flows; the admin interface and customer UI will show the image directly from the blob.

If the blob variables are missing, uploads fall back to the local `public/uploads` path automatically.
