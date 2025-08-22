# 🚀 Deployment Guide - Mandla Rice MRV System

This guide will walk you through deploying your Mandla Rice MRV application to both **Heroku** and **Netlify**.

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ **Git** installed and configured
- ✅ **Node.js 18+** installed
- ✅ **npm 8+** installed
- ✅ **GitHub/GitLab/Bitbucket** repository set up
- ✅ **Heroku account** (for Heroku deployment)
- ✅ **Netlify account** (for Netlify deployment)

## 🌐 Option 1: Deploy to Heroku

### Step 1: Install Heroku CLI

**Windows:**
```bash
# Download from: https://devcenter.heroku.com/articles/heroku-cli
# Or use winget:
winget install --id=Heroku.HerokuCLI
```

**macOS:**
```bash
brew tap heroku/brew && brew install heroku
```

**Linux:**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

### Step 2: Login to Heroku

```bash
heroku login
```

### Step 3: Deploy Using Scripts

#### Windows (PowerShell - Recommended)
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\deploy-heroku.ps1
```

#### Windows (Command Prompt)
```cmd
deploy-heroku.bat
```

#### Linux/macOS
```bash
chmod +x deploy-heroku.sh
./deploy-heroku.sh
```

### Step 4: Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
# 1. Create Heroku app
heroku create your-app-name

# 2. Set buildpack
heroku buildpacks:set heroku/nodejs

# 3. Set environment variables
heroku config:set NODE_ENV=production

# 4. Build the application
npm run build

# 5. Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# 6. Open the app
heroku open
```

### Step 5: Verify Deployment

- ✅ Check build logs: `heroku logs --tail`
- ✅ Open your app: `heroku open`
- ✅ Monitor performance: Heroku dashboard

---

## 🌐 Option 2: Deploy to Netlify

### Step 1: Connect Repository

1. Go to [Netlify](https://netlify.com)
2. Click **"New site from Git"**
3. Choose your Git provider (GitHub, GitLab, Bitbucket)
4. Select your repository

### Step 2: Configure Build Settings

**Build Settings:**
- **Build command**: `cd frontend && npm run build`
- **Publish directory**: `frontend/dist`
- **Node version**: 18

**Environment Variables (if needed):**
```
NODE_VERSION=18
NPM_FLAGS=--legacy-peer-deps
```

### Step 3: Deploy

1. Click **"Deploy site"**
2. Wait for build to complete
3. Your site will be live at a Netlify subdomain
4. Customize domain in site settings

### Step 4: Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow DNS configuration instructions
4. Enable HTTPS (automatic with Netlify)

---

## 🔧 Configuration Files

### Heroku Configuration

**Procfile:**
```
web: node server.js
```

**package.json scripts:**
```json
{
  "scripts": {
    "start": "node server.js",
    "heroku-postbuild": "npm run build"
  }
}
```

**server.js:**
```javascript
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Netlify Configuration

**netlify.toml:**
```toml
[build]
  publish = "frontend/dist"
  command = "cd frontend && npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🚨 Troubleshooting

### Common Heroku Issues

#### Build Failures
```bash
# Check build logs
heroku logs --tail

# Common fixes:
heroku config:set NPM_CONFIG_PRODUCTION=false
heroku config:set NODE_ENV=production
```

#### Runtime Errors
```bash
# Check runtime logs
heroku logs --tail

# Restart app
heroku restart
```

#### Port Issues
```bash
# Heroku automatically sets PORT environment variable
# Ensure your server.js uses: process.env.PORT || 3000
```

### Common Netlify Issues

#### Build Failures
- Check Node.js version (18+)
- Verify build command: `cd frontend && npm run build`
- Check publish directory: `frontend/dist`

#### Routing Issues
- Ensure `netlify.toml` has proper redirects
- Check that SPA routing is configured correctly

#### Environment Variables
- Add required environment variables in Netlify dashboard
- Ensure they're prefixed with `VITE_` for Vite applications

---

## 📊 Monitoring & Maintenance

### Heroku Monitoring

```bash
# View logs
heroku logs --tail

# Check app status
heroku ps

# Monitor performance
heroku addons:open scout

# Scale dynos
heroku ps:scale web=1
```

### Netlify Monitoring

- **Build logs**: Available in deployment history
- **Performance**: Built-in analytics dashboard
- **Forms**: Form submission monitoring
- **Functions**: Serverless function logs

---

## 🔄 Continuous Deployment

### Automatic Deploys

Both platforms support automatic deployment:

**Heroku:**
- Connect GitHub repository
- Enable automatic deploys on main branch
- Configure review apps for pull requests

**Netlify:**
- Automatic deploys on push to main branch
- Preview deployments for pull requests
- Branch deployments for testing

### Environment-Specific Deployments

```bash
# Heroku: Multiple apps for different environments
heroku create mandla-mrv-staging
heroku create mandla-mrv-production

# Netlify: Branch deployments
# main → production
# develop → staging
# feature/* → preview
```

---

## 💰 Cost Considerations

### Heroku
- **Free tier**: Discontinued
- **Basic dyno**: $7/month
- **Standard dyno**: $25/month
- **Performance dyno**: $250/month

### Netlify
- **Free tier**: 100GB bandwidth/month
- **Pro plan**: $19/month
- **Business plan**: $99/month

---

## 🎯 Best Practices

### Performance
- ✅ Enable gzip compression
- ✅ Use CDN for static assets
- ✅ Optimize images and bundles
- ✅ Implement caching strategies

### Security
- ✅ Enable HTTPS (automatic on both platforms)
- ✅ Set security headers
- ✅ Use environment variables for secrets
- ✅ Regular dependency updates

### Monitoring
- ✅ Set up error tracking
- ✅ Monitor performance metrics
- ✅ Configure alerts for downtime
- ✅ Regular log analysis

---

## 🆘 Getting Help

### Heroku Support
- **Documentation**: [devcenter.heroku.com](https://devcenter.heroku.com)
- **Community**: [Stack Overflow](https://stackoverflow.com/questions/tagged/heroku)
- **Status**: [status.heroku.com](https://status.heroku.com)

### Netlify Support
- **Documentation**: [docs.netlify.com](https://docs.netlify.com)
- **Community**: [community.netlify.com](https://community.netlify.com)
- **Status**: [status.netlify.com](https://status.netlify.com)

---

## 🎉 Success Checklist

After deployment, verify:

- ✅ **Build successful** with no errors
- ✅ **Application loads** correctly
- ✅ **All routes work** (SPA routing)
- ✅ **Static assets load** (images, CSS, JS)
- ✅ **Environment variables** configured
- ✅ **Custom domain** working (if applicable)
- ✅ **HTTPS enabled** and working
- ✅ **Performance acceptable** (PageSpeed Insights)
- ✅ **Mobile responsive** design
- ✅ **Cross-browser compatibility**

---

**🚀 Your Mandla Rice MRV application is now deployed and ready to empower farmers! 🌾**
