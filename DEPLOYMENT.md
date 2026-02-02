# Deployment Guide - Voice Assistant App (Vercel Only)

Deploy both frontend and backend to **Vercel** using serverless Python functions. No Railway needed!

## Prerequisites
- GitHub account
- Vercel account (vercel.com)

## Step 1: Push Code to GitHub

```powershell
# From your project directory
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## Step 2: Deploy to Vercel

1. Install Vercel CLI:
   ```powershell
   npm install -g vercel
   ```

2. Deploy:
   ```powershell
   cd "c:\Users\Nikhil sharma\OneDrive\Desktop\tom_dtl\dtl"
   vercel
   ```

3. Follow the prompts:
   - **Project name**: Choose a name for your app
   - **Framework**: Select "Vite"
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
   - **Root directory**: `.` (current directory)

4. When asked about environment variables, **say NO** for now - we'll add them in the dashboard

## Step 3: Add API Key to Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
   - **Name**: `GENAI_API_KEY`
   - **Value**: `AIzaSyB3vT3lgqtN0_-2nFoNVsRY_mMgUfV11j4`
   - **Environments**: Select "Production", "Preview", "Development"
5. Click **Save**

## Step 4: Redeploy to Apply Environment Variables

```powershell
vercel --prod
```

Or redeploy from the dashboard: Go to **Deployments** → Click the latest deployment → **Redeploy**

## Step 5: Test Your Deployment

1. Open your Vercel URL (shown in terminal or dashboard)
2. Click "Tap to Start"
3. Allow microphone permission
4. Test voice commands:
   - "Go to Form"
   - "Go to Queue"
   - "Go to Map"
   - "Read Sign"

## Troubleshooting

### API not responding / 404 errors
- Check Vercel logs: Dashboard → **Deployments** → click latest → **Logs** tab
- Verify `GENAI_API_KEY` is set in **Settings → Environment Variables**
- Try redeploying: `vercel --prod`

### Environment variable not working
- Go to **Settings → Environment Variables**
- Delete and re-add `GENAI_API_KEY`
- Redeploy: `vercel --prod`

### Frontend can't reach backend
- This shouldn't happen since they're on same domain
- Check browser console (F12) for network errors
- Verify `/api/` endpoints in Vercel logs

### Voice not working
- Check microphone permissions in browser
- Try on Chrome/Edge (best support)
- Mobile Safari: uses audio upload mode

## How It Works

- **Frontend code** (React) lives in `src/` and `public/`
- **Backend code** (Python Flask) lives in `api/index.py` as a serverless function
- **Vercel automatically routes**: `/api/*` calls go to `api/index.py`
- **Environment variables**: Managed entirely in Vercel dashboard

## Sharing with Others

Your app is now live at: **https://your-vercel-url.vercel.app**

Share this link with anyone to use your Voice Assistant!

## Cost

- **Vercel**: Free tier (100 deployments/month, unlimited serverless function executions)
- **Gemini API**: First 50 requests/day free, then paid

## Support

- Vercel docs: https://vercel.com/docs
- Gemini API docs: https://ai.google.dev
