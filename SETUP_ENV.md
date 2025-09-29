# Environment Setup Instructions

## Vercel Blob Storage Setup

According to the [Vercel Blob SDK documentation](https://vercel.com/docs/vercel-blob/using-blob-sdk), you need to set up the `BLOB_READ_WRITE_TOKEN` environment variable.

### Steps to get your token:

1. Go to your Vercel dashboard
2. Navigate to your project settings
3. Go to "Environment Variables" 
4. Look for `BLOB_READ_WRITE_TOKEN` or create it if it doesn't exist
5. Copy the token value

### To set it locally:

Create a `.env.local` file in the project root with:

```bash
# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your_actual_token_here

# Authentication (from your existing setup)
AUTH_PASSWORD_HASH=$2b$10$KTIKFAP1dOpdkx0WFFoXsOvTw/U87NLUHSCu.ymwAv1W4oTnLYOcC
IRON_SESSION_PASSWORD=your-32-character-secret-here
IRON_SESSION_COOKIE_NAME=gbbo_session
```

### Alternative: Use Vercel CLI

If you have the Vercel CLI installed, you can run:

```bash
vercel env pull
```

This will automatically download all environment variables from your Vercel project.

### Test the connection

Once you have the token set, you can test the blob storage connection by running:

```bash
npm run dev
```

And then visit the admin pages to see if the data loads correctly.

## Current Status

The blob storage implementation is already set up correctly in the code. It just needs the proper environment variable to connect to your Vercel Blob store.
