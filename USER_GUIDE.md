# User Access Guide - Voice Assistant App

## For End Users

### **How to Access the App**

1. **Open the Public URL** (once deployed):
   ```
   https://your-app.vercel.app
   ```

2. **Login** (if authentication enabled):
   - Email: Any valid email
   - Password: Any password with 6+ characters
   - Demo mode - no backend verification needed

3. **Start Using:**
   - Tap the screen to activate voice input
   - Allow microphone permission
   - Say commands:
     - "Go to Form" - Fill forms with voice
     - "Go to Queue" - Check queue status
     - "Go to Map" - QR code navigation
     - "Read Sign" - OCR sign reader

## For Admins / Organizations

### **Option 1: Public Access (No Login)**
- Remove login screen - anyone can use
- Good for public kiosks or general access
- No tracking of who used it

### **Option 2: With Login (Current)**
- Users log in before accessing
- See who used the app and when
- Can add user management later
- Demo credentials: any email + 6+ char password

### **Option 3: API Key Authentication**
- Users get personal API key
- Share: `https://your-app.vercel.app?key=USER_API_KEY`
- Track per-user usage
- Rate limit individual users

## Sharing Links with Users

### **Method 1: Direct URL**
```
https://your-app.vercel.app
```
- Share via email, Slack, Teams, WhatsApp
- Users can bookmark for quick access

### **Method 2: QR Code**
- Generate QR code pointing to your Vercel URL
- Users scan with phone camera
- Opens app directly

### **Method 3: Embed in Website**
```html
<iframe 
  src="https://your-app.vercel.app" 
  width="100%" 
  height="600px">
</iframe>
```

### **Method 4: Mobile App Link**
```
https://your-app.vercel.app/?phone=true
```
Optimized for mobile devices

## Managing Multiple Users

### **Track Usage (Backend Admin Panel)**
Add to backend:
```python
# Log user activity
@app.route('/api/log_usage', methods=['POST'])
def log_usage():
    data = request.json
    user_email = data.get('email')
    action = data.get('action')
    timestamp = datetime.now()
    # Save to database
    return {'status': 'logged'}
```

### **Rate Limiting (Per User)**
```python
# Limit API calls per user
RATE_LIMIT = {
    'user@example.com': {'calls': 100, 'reset_time': '2026-02-04'}
}
```

## API Endpoints Users Can Access

### **Public Endpoints** (No auth required):
```
GET  /api/status           - Check if API is online
POST /api/transcribe       - Convert speech to text
POST /api/analyze_sign     - Read text from images
```

### **Protected Endpoints** (Coming soon):
```
POST /api/user/register    - Create new account
POST /api/user/login       - Authenticate user
GET  /api/user/usage       - Get user's usage stats
```

## Security & Best Practices

### **Protecting Your API Key**
- ✅ Store in `.env` file (not in code)
- ✅ Use environment variables
- ✅ Never share publicly
- ✅ Rotate keys periodically

### **User Data Privacy**
- User emails: Stored in browser localStorage only
- Audio files: Sent to Gemini API (processed, not stored)
- Images: Sent to Gemini API (processed, not stored)
- No personal data saved on your server

### **Rate Limiting** (To prevent abuse)
- Limit: 100 requests per user per day
- Backend tracks usage per IP
- Auto-reject if limit exceeded

## Support

### **Common Issues**

**"Microphone not working"**
- Check browser permissions
- Allow microphone access
- Try Chrome/Edge browser

**"Server not responding"**
- Check if backend is deployed on Railway
- Verify Gemini API key is set
- Check internet connection

**"Voice commands not recognized"**
- Speak clearly and slowly
- Use exact phrases like "Go to Form"
- Check browser console for errors

### **Contact Support**
- Email: support@your-domain.com
- GitHub Issues: nikhil7780/dtl_test/issues

## Next Steps

1. **Deploy to Vercel** - Get public URL
2. **Deploy to Railway** - Get backend running
3. **Share the link** - With your users
4. **Collect feedback** - Improve the app
5. **Scale up** - Add more features

