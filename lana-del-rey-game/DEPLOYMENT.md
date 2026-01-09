# 🚀 Deployment Guide - Lana Del Rey Game

Quick guide for deploying the Lana Del Rey Song Guessing Game on various platforms.

## 🔷 Replit (Recommended - Easiest!)

### Method 1: One-Click Deploy
1. Go to your Replit dashboard
2. Click "Create Repl"
3. Select "Import from GitHub"
4. Enter repository URL or upload the `lana-del-rey-game` folder
5. Click "Run" ▶️
6. Game opens automatically in webview!

### Method 2: Direct Upload
1. Go to [Replit.com](https://replit.com)
2. Create a new HTML/CSS/JS Repl
3. Drag and drop all files from `lana-del-rey-game/` folder
4. Click "Run" ▶️
5. Done! 🎉

### Replit Features:
- ✅ Instant deployment
- ✅ Free hosting
- ✅ Shareable URL
- ✅ Auto-configuration (uses `.replit` file)
- ✅ No setup required

**Your Replit URL will look like:**
`https://lana-del-rey-game.username.repl.co`

---

## 🌐 GitHub Pages

### Setup:
1. Push code to GitHub repository
2. Go to Settings → Pages
3. Select branch: `main` or your feature branch
4. Set folder to: `/lana-del-rey-game` or root
5. Click "Save"
6. Wait 1-2 minutes for deployment

**Your GitHub Pages URL:**
`https://username.github.io/repo-name/lana-del-rey-game/`

---

## 🔥 Netlify

### Drag & Drop Deploy:
1. Go to [Netlify.com](https://netlify.com)
2. Sign up/Login
3. Drag `lana-del-rey-game` folder onto Netlify Drop
4. Get instant URL!

### Git Deploy:
1. Connect GitHub repository
2. Build command: (leave empty)
3. Publish directory: `lana-del-rey-game`
4. Deploy!

**Features:**
- Free SSL certificate
- Custom domains
- Instant deploys
- CDN worldwide

---

## ⚡ Vercel

### Deploy:
1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to game folder:
   ```bash
   cd lana-del-rey-game
   vercel
   ```
3. Follow prompts
4. Get production URL!

### Or Use Dashboard:
1. Go to [Vercel.com](https://vercel.com)
2. Import Git repository
3. Set root directory: `lana-del-rey-game`
4. Deploy!

---

## 🔵 Azure Static Web Apps

### Deploy:
1. Go to [Azure Portal](https://portal.azure.com)
2. Create Static Web App
3. Connect to GitHub repo
4. App location: `lana-del-rey-game`
5. Output location: (leave empty)
6. Deploy!

**Free tier includes:**
- 100 GB bandwidth/month
- Custom domains
- SSL certificates

---

## 🟠 AWS S3 + CloudFront

### Setup:
1. Create S3 bucket
2. Enable static website hosting
3. Upload all files from `lana-del-rey-game/`
4. Set bucket policy to public read
5. (Optional) Set up CloudFront for CDN

**Bucket Policy Example:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::your-bucket-name/*"
  }]
}
```

---

## 🐳 Docker (Advanced)

### Dockerfile:
```dockerfile
FROM nginx:alpine
COPY lana-del-rey-game/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Deploy:
```bash
docker build -t lana-del-rey-game .
docker run -p 8080:80 lana-del-rey-game
```

Visit: `http://localhost:8080`

---

## 📱 Local Development

### Option 1: Python Server
```bash
cd lana-del-rey-game
python3 -m http.server 8000
# Visit: http://localhost:8000
```

### Option 2: Node.js Server
```bash
cd lana-del-rey-game
npx http-server -p 8000
# Visit: http://localhost:8000
```

### Option 3: PHP Server
```bash
cd lana-del-rey-game
php -S localhost:8000
# Visit: http://localhost:8000
```

### Option 4: VS Code Live Server
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

---

## ✅ Post-Deployment Checklist

After deploying, verify:
- [ ] Page loads without errors
- [ ] 3D scene renders (vinyl records, roses, particles)
- [ ] All three difficulty buttons work
- [ ] Game starts and questions load
- [ ] Timer counts down
- [ ] Answer buttons respond to clicks
- [ ] Score updates correctly
- [ ] Power-ups (Skip/Hint) work
- [ ] Result screen displays at end
- [ ] Mobile responsive (test on phone)
- [ ] No console errors (F12 Developer Tools)

---

## 🔧 Troubleshooting

### Issue: 3D Scene Not Loading
**Solution:** Check browser console for WebGL errors. Ensure browser supports WebGL.

### Issue: Three.js Not Loading
**Solution:** Ensure internet connection (Three.js loads from CDN). Check console for 404 errors.

### Issue: Mobile Layout Issues
**Solution:** Clear browser cache. Ensure viewport meta tag is present in HTML.

### Issue: Slow Performance
**Solution:**
- Close other tabs
- Test on different device
- Check internet speed (for CDN loading)

---

## 🌟 Optimization Tips

### For Production:
1. **Download Three.js locally** instead of CDN for faster loading:
   ```html
   <script src="three.min.js"></script>
   ```

2. **Minify CSS and JS** using tools like:
   - [CSS Minifier](https://cssminifier.com/)
   - [JS Minifier](https://javascript-minifier.com/)

3. **Enable Gzip compression** on your server

4. **Add caching headers** for static assets

5. **Use a CDN** for global distribution

---

## 📊 Analytics (Optional)

### Add Google Analytics:
```html
<!-- Add before </head> in index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## 🎉 You're Ready!

Choose the deployment method that works best for you. **Replit** is the fastest and easiest for beginners!

**Need help?** Check the main [README.md](README.md) for more details.

---

*Made with 🌹 for Lana Del Rey fans*
