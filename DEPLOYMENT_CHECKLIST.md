# Quick Deployment Checklist

## ✅ Frontend (Vercel) - DONE

- [x] Three.js compatibility fixed
- [x] Environment variables configured
- [x] Build optimization added
- [x] Chunk size warnings resolved

## 🔄 Backend (Render) - ACTION REQUIRED

### Step 1: Update Backend on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Find your backend service
3. Click **Manual Deploy** → **Deploy latest commit**

   OR

   If you have auto-deploy enabled, it should deploy automatically from the `main` branch

### Step 2: Verify CORS Configuration

The backend now allows:

- ✅ `https://design-den1.vercel.app`
- ✅ `https://design-den1-*.vercel.app` (preview deployments)
- ✅ `http://localhost:*` (local development)

### Step 3: Check Your Vercel Domain

1. Go to your Vercel project settings
2. Find your actual production domain (e.g., `https://your-project.vercel.app`)
3. If it's different from `design-den1.vercel.app`, update `server.cjs` line 824-827

## 🧪 Testing

After backend redeploys:

1. Open your Vercel site: `https://design-den1.vercel.app`
2. Try to login
3. Check browser console for errors
4. If you see CORS errors, check the backend logs on Render

## 🐛 Troubleshooting

### "Cannot connect to backend server"

- ✅ Check if Render backend is running
- ✅ Verify environment variable: `VITE_API_URL=https://backend-gw9o.onrender.com`
- ✅ Check Render logs for CORS warnings
- ✅ Ensure backend redeployed with new CORS settings

### Still getting CORS errors?

Check backend Render logs - you'll see:

```
⚠️  CORS blocked origin: https://your-actual-domain.vercel.app
```

If the domain is different, update the `allowedOrigins` array in `server.cjs`.

## 📝 Files Changed

- ✅ `server.cjs` - Updated CORS configuration
- ✅ `vite.config.js` - Added build optimization
- ✅ `src/components/ModelViewer.jsx` - Fixed Three.js compatibility
- ✅ `.env.production` - Production backend URL

All changes pushed to both `design-den1` and `backend` repositories!
