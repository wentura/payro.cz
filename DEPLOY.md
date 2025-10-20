# Deployment Guide - FKTR.cz

Complete guide for deploying FKTR.cz to Netlify

## 🚀 Quick Deploy to Netlify

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Connect to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and select your repository
4. Netlify will auto-detect Next.js settings

### Step 3: Configure Build Settings

Netlify should auto-detect these, but verify:

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: 20 (from netlify.toml)

### Step 4: Add Environment Variables

In Netlify Dashboard → **Site settings** → **Environment variables**, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
```

### Step 5: Deploy!

Click **"Deploy site"** - should build successfully now! ✅

---

## 🔧 Troubleshooting

### Build fails with dependency errors

The `.npmrc` file should handle this, but if it still fails:

1. In Netlify, go to **Site settings** → **Build & deploy** → **Environment**
2. Add environment variable:
   - Key: `NPM_FLAGS`
   - Value: `--legacy-peer-deps`

### Database connection errors

Make sure you've set all three environment variables correctly in Netlify dashboard.

### "Module not found" errors

Clear Netlify cache:

1. Go to **Deploys**
2. Click **"Trigger deploy"** → **"Clear cache and deploy"**

---

## 📝 Post-Deployment Checklist

After successful deployment:

- [ ] Visit your site URL
- [ ] Test registration (create account)
- [ ] Test login
- [ ] Create a client
- [ ] Create an invoice
- [ ] Test print/QR code functionality
- [ ] Test password reset
- [ ] Test all pages on mobile

---

## 🌐 Custom Domain

To use `fktr.cz`:

1. In Netlify: **Domain settings** → **Add custom domain**
2. Enter: `fktr.cz`
3. Follow DNS configuration instructions
4. Update environment variable `NEXT_PUBLIC_APP_URL` to `https://fktr.cz`

---

## 🔐 Production Security

Before going live:

1. **Enable Row Level Security** in Supabase
2. Set up **database backups**
3. Configure **CORS** properly
4. Enable **HTTPS only** (automatic on Netlify)
5. Review **all API endpoints** for security

---

## 📊 Monitoring

Recommended tools:

- **Netlify Analytics** - Built-in traffic analytics
- **Supabase Dashboard** - Database monitoring
- **Sentry** - Error tracking (optional)

---

## 🔄 Updates

To deploy updates:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

Netlify will automatically rebuild and deploy! 🎉

---

**Need help?** Check Netlify docs: https://docs.netlify.com/integrations/frameworks/next-js/
