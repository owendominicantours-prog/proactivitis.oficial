## Blob storage uploads

This project now uploads optimized tour images to an external blob (S3-compatible) instead of keeping them on disk. To configure it:

1. Provide this environment variable (Vercel Dashboard → Environment Variables):
   - `BLOB_READ_WRITE_TOKEN` (token that Vercel shows after creating and linking the Blob Store). There’s no need for project ID because `@vercel/blob` infers it from `vercel.json`.

2. The upload API (`POST /api/upload`) validates the file, optimizes it with `sharp`, and pushes it to Vercel Blob via `@vercel/blob` using `put()`. The traffic is signed with the `BLOB_READ_WRITE_TOKEN`. The response includes `url` (public image URL).

3. Use the returned `url` in the tour creation flows; the admin interface and customer UI will show the image directly from the blob.

4. If the Blob settings are missing, uploads still fall back to the local `public/uploads` path so el upload no falla.
