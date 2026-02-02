# Deployment Guide - Voice Assistant App

## Prerequisites
- GitHub account
- Railway account (railway.app)
- Vercel account (vercel.com)

## Step 1: Push Code to GitHub

```powershell
# From your project directory
git add .
git commit -m "Prepare for deployment"
git push origin main
```

## Step 2: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Railway will auto-detect it's a Python project
7. Go to Settings → Variables
8. Add environment variable:
   - Name: `GENAI_API_KEY`
   - Value: `AIzaSyAoQfUFFo00nu_nWU5mb6CtDcq5cu25YME`
9. Your backend URL will be shown (e.g., `https://your-app-backend.railway.app`)

## Step 3: Update Frontend with Backend URL

1. Edit `.env.production`:
   ```
   VITE_API_URL=https://your-app-backend.railway.app
   ```
   (Replace with your actual Railway backend URL)

2. Commit and push:
   ```powershell
   git add .env.production
   git commit -m "Update backend URL for production"
   git push origin main
   ```

## Step 4: Deploy Frontend to Vercel

1. Install Vercel CLI:
   ```powershell
   npm install -g vercel
   ```

2. Deploy:
   ```powershell
   cd "c:\Users\Nikhil sharma\OneDrive\Desktop\tom_dtl\dtl"
   vercel
   ```

3. Follow prompts:
   - Connect to GitHub
   - Select your project
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

4. Vercel will give you a public URL

## Step 5: Test Deployment

1. Open your Vercel URL
2. Click "Tap to Start"
3. Allow microphone permission
4. Test voice commands:
   - "Go to Form"
   - "Go to Queue"
   - "Go to Map"
   - "Read Sign"

## Troubleshooting

### Backend not responding
- Check Railway logs: Project → Deployments → View logs
- Verify GENAI_API_KEY is set

### Frontend can't reach backend
- Check browser console (F12)
- Ensure `.env.production` has correct backend URL
- Verify CORS is enabled in backend (already enabled)

### Voice not working
- Check microphone permissions in browser
- Try Web Speech API on Chrome/Edge
- Mobile Safari: uses audio upload mode

## Sharing with Others

Your app is now live at: **https://your-vercel-url.vercel.app**

Share this link with anyone to use your Voice Assistant!

## Cost

- **Vercel**: Free tier (up to 100 deployments/month)
- **Railway**: Free tier ($5/month credit, usually enough)
- **Gemini API**: First 50 requests/day free, then paid

## Support

For issues with deployment:
- Railway docs: https://docs.railway.app
- Vercel docs: https://vercel.com/docs
