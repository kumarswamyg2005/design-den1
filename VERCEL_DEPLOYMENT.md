# Vercel Deployment Configuration

## Environment Variables

For your Vercel deployment to work properly, you need to set the following environment variable:

### Required Environment Variable

```
VITE_API_URL=https://backend-gw9o.onrender.com
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings**
3. Navigate to **Environment Variables**
4. Add the variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://backend-gw9o.onrender.com`
   - **Environments**: Select all (Production, Preview, Development)
5. Click **Save**
6. Redeploy your project for changes to take effect

## Important Notes

- The `.env.production` file is included in the repository and will be used automatically during build
- If you need to change the backend URL, update it in Vercel's environment variables
- Make sure your backend (Render) is running and accessible
- **CRITICAL**: Update the `allowedOrigins` array in `server.cjs` with your actual Vercel URL (e.g., `https://design-den1.vercel.app`)

## Backend CORS Configuration

Your backend needs to allow your Vercel domain. The `server.cjs` file has been configured to allow:

- `https://design-den1.vercel.app` (production)
- Preview deployments: `https://design-den1-*.vercel.app`

If your Vercel URL is different, update line 824-827 in `server.cjs`

## Fixes Applied

✅ **Three.js Compatibility**: Fixed `sRGBEncoding` deprecation issue by using `SRGBColorSpace` (compatible with Three.js v0.181.2)

✅ **Backend Connection**: Added proper environment configuration for production deployment

## Redeploying

After pushing these changes, Vercel will automatically:

1. Detect the new commit
2. Rebuild your application
3. Use the `.env.production` file for production builds
4. Connect to your Render backend

Your deployment should now work without errors!
