# 🎨 BodyMetrics PWA Icons

This directory contains the app icons for Progressive Web App functionality.

## 🚀 Quick Setup

1. **Open the Icon Generator**: Open `generate-icons.html` in your browser
2. **Download All Icons**: Click "Download All Icons" or download individual sizes
3. **Save to Icons Folder**: Place all PNG files in this directory
4. **Icons Ready**: Your PWA will automatically use these icons!

## 📁 Files in This Directory

### Source Files
- `source-icons.svg` - Complete icon collection from Claude Chat
- `app-logo.svg` - Extracted main app logo
- `generate-icons.html` - Browser-based icon generator

### Generated Icons (after using generator)
- `icon-16x16.png` - Favicon small
- `icon-32x32.png` - Favicon large  
- `icon-72x72.png` - Android small
- `icon-96x96.png` - Android medium
- `icon-128x128.png` - Android large
- `icon-144x144.png` - Windows tile
- `icon-152x152.png` - iOS iPad
- `icon-180x180.png` - iOS iPhone
- `icon-192x192.png` - Android XL (maskable)
- `icon-384x384.png` - Android XXL
- `icon-512x512.png` - PWA standard (maskable)

## 🎯 Design Details

- **Colors**: Primary #2563eb (blue), White text
- **Style**: Clean, modern "BM" monogram
- **Format**: Square icons with rounded corners
- **Compatibility**: Works on iOS, Android, Windows, and all PWA platforms

## ✅ Icon Requirements Met

- ✅ All required PWA sizes (72px to 512px)
- ✅ iOS-specific sizes (152px, 180px)
- ✅ Favicon sizes (16px, 32px)
- ✅ Maskable icons for Android
- ✅ Proper manifest.json integration
- ✅ Apple touch icon meta tags

## 🛠️ Alternative Generation Methods

If the HTML generator doesn't work, you can also:

1. **Online Tools**:
   - PWA Asset Generator: https://tools.crawl.dev/
   - Real Favicon Generator: https://realfavicongenerator.net/

2. **Design Software**:
   - Export `app-logo.svg` at different sizes
   - Use Figma, Sketch, or Adobe Illustrator

3. **Command Line**:
   - Use ImageMagick or similar tools to batch convert SVG to PNG

## 🔍 Testing Icons

After generating icons:
1. Serve the app from a web server
2. Check Developer Tools → Application → Manifest
3. Look for "Add to Home Screen" option
4. Test on mobile devices for proper icon display