# Vercel Deployment Guide - Fix 404 Errors

## ⚠️ Common Issue: 404 NOT_FOUND Error

If you're seeing `404: NOT_FOUND` errors on Vercel, it's because **Vercel doesn't know where your Frontend code is**.

## ✅ Solution: Set Root Directory

### Step-by-Step Fix:

1. **Go to your Vercel project dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Open Project Settings**
   - Click **Settings** tab
   - Navigate to **General** section

3. **Configure Root Directory** ⭐ MOST IMPORTANT
   - Find **Root Directory** setting
   - Click **Edit**
   - Enter: `Frontend`
   - Click **Save**

4. **Verify Build Settings**
   - Should show:
     ```
     Framework Preset: Vite
     Build Command: npm run build
     Output Directory: dist
     Install Command: npm install
     ```

5. **Add Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Add these:
     ```
     VITE_FIREBASE_API_KEY=your_firebase_api_key
     VITE_GEOAPIFY_API_KEY=your_geoapify_api_key
     ```

6. **Redeploy**
   - Go to **Deployments** tab
   - Click **⋯** (three dots) on latest deployment
   - Click **Redeploy**
   - ✅ Your app should now work!

## 🔐 About Environment Variable Warning

When adding `VITE_FIREBASE_API_KEY` and `VITE_GEOAPIFY_API_KEY`, Vercel will show:

> ⚠️ This key, which is prefixed with VITE_ and includes the term KEY, might expose sensitive information to the browser.

### This is SAFE and Expected:

- **VITE_ prefix** = Client-side variables (public by design)
- **Firebase API keys** are meant to be public:
  - Secured by domain restrictions in Firebase Console
  - Go to Firebase Console → Project Settings → Authorized domains
  - Add your Vercel domain (e.g., `your-app.vercel.app`)
  
- **Geoapify API keys** are also meant to be public:
  - Secured by HTTP referrer restrictions
  - Go to Geoapify Dashboard → API Keys → Configure referrers
  - Add your Vercel domain

### Click **Continue** when you see this warning - it's safe!

## 📁 Project Structure Understanding

Your repository has this structure:
```
Shinobi--Food-Delivery-App/
├── Backend/          ← Deploy this to Render
│   ├── package.json
│   ├── index.js
│   └── ...
└── Frontend/         ← Deploy this to Vercel (set as Root Directory)
    ├── package.json
    ├── vercel.json
    ├── index.html
    └── ...
```

Vercel needs to know it should only build the **Frontend** folder, not the whole repository.

## 🔄 Alternative: Deploy with Vercel CLI

If dashboard method doesn't work:

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to Frontend folder
cd Frontend

# Deploy (will ask for configuration)
vercel

# Answer prompts:
# - Setup and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? shinobi-food-delivery
# - In which directory is your code? ./
# - Override settings? No

# Production deployment
vercel --prod
```

## ✅ Checklist Before Deployment

- [ ] Root Directory set to `Frontend` in Vercel
- [ ] `vercel.json` exists in Frontend folder
- [ ] Environment variables added (VITE_FIREBASE_API_KEY, VITE_GEOAPIFY_API_KEY)
- [ ] Firebase Console: Added Vercel domain to authorized domains
- [ ] Geoapify Dashboard: Added Vercel domain to referrers
- [ ] Backend deployed on Render and running
- [ ] Frontend updated with backend API URL (if using VITE_API_URL)

## 🆘 Still Having Issues?

1. **Check Build Logs**
   - Go to Deployments → Click on failed deployment → View logs
   - Look for specific errors

2. **Common Errors**:
   - `Cannot find module` → Missing dependency in package.json
   - `Build failed` → Check for TypeScript/ESLint errors
   - `404 on routes` → Root Directory not set correctly

3. **Test Locally First**:
   ```bash
   cd Frontend
   npm run build
   npm run preview
   ```
   If this works, deployment should too.

## 📞 Support

If you're still stuck:
- Check Vercel Status: https://www.vercel-status.com/
- Vercel Discord: https://vercel.com/discord
- GitHub Issues: https://github.com/souvik0808k/Shinobi--Food-Delivery-App/issues
