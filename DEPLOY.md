# Deployment Guide

## Quick Deploy to Vercel

### Option 1: Via Vercel Dashboard (Recommended)

1. Push this code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Vite
6. Click "Deploy"
7. Done! Your app will be live at `https://your-project.vercel.app`

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# For production
vercel --prod
```

## What Gets Deployed

- Optimized production build from `dist/` folder
- Static assets with CDN
- Automatic HTTPS
- SPA routing via `vercel.json`

## Backend Connection

The frontend automatically connects to:
```
https://gurugammon.onrender.com
```

No environment variables needed!

## Post-Deployment

After deploying, test these flows:

1. **Google OAuth**:
   - Click "Continue with Google"
   - Should redirect to backend OAuth
   - Should come back with token and land on dashboard

2. **Guest Mode**:
   - Click "Play as Guest"
   - Should create guest account
   - Should land on dashboard

3. **Profile Loading**:
   - Dashboard should show username
   - Logout should work
   - Refresh should maintain session

## Custom Domain (Optional)

1. Go to Vercel project settings
2. Add custom domain
3. Follow DNS instructions
4. Done!

## Troubleshooting

### OAuth Not Working
- Check backend is running at `https://gurugammon.onrender.com`
- Verify backend has correct OAuth callback URL
- Check browser console for errors

### Guest Login Fails
- Verify backend `/api/auth/guest` endpoint is accessible
- Check network tab for API errors
- Ensure CORS is enabled on backend

### Dashboard Shows Loading Forever
- Check if token is in localStorage
- Verify token is valid (not expired)
- Check `/api/user/profile` endpoint response

## Support

For backend issues, check: https://github.com/8888vtc-ui/gurugammon-antigravity
