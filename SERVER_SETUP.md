# 🚀 BodyMetrics - Local Server Setup

To use the **full PWA features** (offline functionality, notifications, "Add to Home Screen"), you need to serve the app through a web server instead of opening the HTML file directly.

## 🚨 Why Do I Need This?

Service Workers (required for PWA features) don't work with the `file://` protocol for security reasons. They require `http://` or `https://`.

## ⚡ Quick Setup Options

### Option 1: Python (Most Common)
If you have Python installed:

```bash
# Navigate to the project folder
cd /path/to/body-metrics

# Python 3 (recommended)
python -m http.server 8000

# Python 2 (if needed)
python -m SimpleHTTPServer 8000
```

Then open: `http://localhost:8000`

### Option 2: Node.js (npx)
If you have Node.js installed:

```bash
# Navigate to the project folder
cd /path/to/body-metrics

# Using npx (no installation needed)
npx serve .

# Or install and use serve globally
npm install -g serve
serve .
```

Then open the URL shown in the terminal (usually `http://localhost:3000`)

### Option 3: Live Server (VS Code)
If you use VS Code:

1. Install the "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 4: PHP (If Available)
If you have PHP installed:

```bash
# Navigate to the project folder
cd /path/to/body-metrics

# Start PHP server
php -S localhost:8000
```

Then open: `http://localhost:8000`

## ✅ Testing PWA Features

Once running on a local server, you can test:

1. **Offline Mode**: Disconnect from internet, app should still work
2. **Install App**: Look for "Add to Home Screen" option in browser menu
3. **Notifications**: Enable in Profile → Notification Settings
4. **Service Worker**: Check Developer Tools → Application → Service Workers

## 🌐 Production Deployment

For production, deploy to any static hosting service:

- **GitHub Pages** (free, automatic deployment)
- **Netlify** (free tier available)
- **Vercel** (free tier available)
- **Firebase Hosting** (free tier available)

## 💡 Troubleshooting

- **Service Worker errors**: Make sure you're using `http://` or `https://`, not `file://`
- **Notification permission**: Must be granted manually by user
- **iOS Safari**: PWA features work on iOS 11.3+ but may need manual "Add to Home Screen"
- **HTTPS required**: Some features only work on HTTPS in production

## 🔧 Development Tips

- Use `http://localhost:8000` (not `127.0.0.1`) for better compatibility
- Clear browser cache if you update the service worker
- Check DevTools → Console for any error messages
- Use DevTools → Application tab to inspect PWA features