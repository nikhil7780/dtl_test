# Deployment Checklist

## Pre-Deployment

- [ ] All code committed to GitHub: `https://github.com/nikhil7780/dtl_test`
- [ ] API key stored in `.env`: `GENAI_API_KEY=AIzaSyAoQfUFFo00nu_nWU5mb6CtDcq5cu25YME`
- [ ] `.env` file is in `.gitignore` (never committed)
- [ ] Tested locally on desktop: `localhost:5176`
- [ ] Tested locally on mobile: `10.70.213.231:5176`
- [ ] Voice input working (Web Speech API + fallback)
- [ ] Login screen working
- [ ] All routes accessible
- [ ] No console errors in browser DevTools

## Backend Deployment (Railway)

### Step 1: Connect Repository
- [ ] Go to https://railway.app
- [ ] Sign up / Login with GitHub
- [ ] Click "New Project" → "Deploy from GitHub"
- [ ] Select repository: `nikhil7780/dtl_test`
- [ ] Click "Deploy"

### Step 2: Set Environment Variables
- [ ] Open project settings
- [ ] Go to "Variables" tab
- [ ] Add: `GENAI_API_KEY=AIzaSyAoQfUFFo00nu_nWU5mb6CtDcq5cu25YME`
- [ ] Optional: `FLASK_ENV=production`
- [ ] Save variables

### Step 3: Verify Deployment
- [ ] Wait for build to complete (5-10 min)
- [ ] Check deployment logs for errors
- [ ] Copy the generated Railway URL (e.g., `https://dtl-test-production.up.railway.app`)
- [ ] Test backend URL: `https://your-railway-url/api/status`

### Step 4: Note for Frontend
- [ ] Save Railway URL for use in Vercel
- [ ] Format: `https://your-railway-url` (without trailing slash)

## Frontend Deployment (Vercel)

### Step 1: Connect Repository
- [ ] Go to https://vercel.com
- [ ] Sign up / Login with GitHub
- [ ] Click "New Project"
- [ ] Select repository: `nikhil7780/dtl_test`
- [ ] Vercel auto-detects Vite

### Step 2: Set Environment Variables
- [ ] In "Environment Variables" section:
  - **Name**: `VITE_API_URL`
  - **Value**: `https://your-railway-url` (from Railway deployment)
- [ ] Add for all environments (Production, Preview, Development)
- [ ] Click "Deploy"

### Step 3: Verify Deployment
- [ ] Wait for build to complete (2-5 min)
- [ ] Check build logs for errors
- [ ] Copy the generated Vercel URL (e.g., `https://dtl-test.vercel.app`)
- [ ] Open in browser

### Step 4: Test Live App
- [ ] [ ] Login page loads
- [ ] [ ] Can login (any email + 6+ char password)
- [ ] [ ] Home page displays correctly
- [ ] [ ] Voice input works (try "Go to Form")
- [ ] [ ] Camera/QR scanner works
- [ ] [ ] Voice feedback audible
- [ ] [ ] Mobile responsive (test on phone)
- [ ] [ ] No console errors

## Post-Deployment

### Documentation
- [ ] Save Vercel public URL
- [ ] Save Railway backend URL
- [ ] Document both URLs in `DEPLOYMENT_INFO.md`
- [ ] Update README with public link

### User Access
- [ ] Create QR code for `https://your-vercel-url`
- [ ] Share link via email/message
- [ ] Test access from different device
- [ ] Verify login works for new users

### Monitoring
- [ ] Check Railway logs daily for errors
- [ ] Monitor Vercel deployment status
- [ ] Set up email alerts if available
- [ ] Test app weekly

### Performance
- [ ] Check Vercel analytics dashboard
- [ ] Check page load time (should be < 3s)
- [ ] Check API response time (should be < 5s)
- [ ] Monitor error rate (should be < 1%)

## Troubleshooting

### Backend not responding
```
Railway Logs: Check for Python errors
Solution: 
1. Verify GENAI_API_KEY is set
2. Check requirements.txt has all dependencies
3. Verify Procfile exists and is correct
```

### Frontend won't load
```
Vercel Logs: Check for build errors
Solution:
1. Verify VITE_API_URL is set correctly
2. Check for missing dependencies
3. Try rebuilding: Vercel Dashboard → Redeploy
```

### Voice not working on live app
```
Check:
1. Microphone permission granted
2. Browser supports Web Speech API (Chrome/Edge)
3. Mobile fallback working (iOS/Safari)
4. Check browser console for errors
```

### API calls failing with CORS error
```
Solution:
1. Verify VITE_API_URL doesn't have trailing slash
2. Check backend has Flask-CORS enabled
3. Verify Gemini API key is correct
4. Check Railway logs for API errors
```

## Rollback Plan

If something breaks:
1. On Vercel: Click "Deployments" → select previous version → "Promote to Production"
2. On Railway: Revert to previous build in deployment history
3. Always keep working code in `main` branch
4. Use git tags for releases: `git tag v1.0.0 && git push origin v1.0.0`

## URLs to Remember

- **Frontend**: https://dtl-test.vercel.app (example)
- **Backend**: https://dtl-test-production.up.railway.app (example)
- **GitHub**: https://github.com/nikhil7780/dtl_test
- **Gemini API Key**: AIzaSyAoQfUFFo00nu_nWU5mb6CtDcq5cu25YME

## Performance Targets

- **Page Load Time**: < 3 seconds
- **API Response**: < 5 seconds
- **Voice Recognition**: < 10 seconds
- **Image OCR**: < 8 seconds
- **Uptime**: 99.5%+

---

**Status**: Ready for deployment
**Last Updated**: 2026-02-04
**Next Review**: After first deployment

