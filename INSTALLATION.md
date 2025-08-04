# Installation Guide

## Quick Start

The Chrome extension is now ready to install! Follow these steps:

### 1. Build the Extension (if not already done)

```bash
pnpm install
pnpm run build
```

### 2. Load in Chrome

1. **Open Chrome** and navigate to `chrome://extensions/`
2. **Enable Developer Mode** (toggle in top-right corner)
3. **Click "Load unpacked"**
4. **Select the `dist` folder** from this project
5. **The extension should now appear** in your extensions list

### 3. Test the Extension

1. **Click the extension icon** in your Chrome toolbar
2. **Toggle "Enable Dark Mode"** to turn it on/off
3. **Visit any website** to see dark mode in action
4. **Customize settings** using the popup interface

## Features to Test

### Basic Functionality

- ✅ Toggle dark mode on/off
- ✅ Different darkness levels (Light, Medium, Dark, Very Dark)
- ✅ High contrast mode
- ✅ Font size adjustments
- ✅ Image preservation toggle

### Advanced Features

- ✅ Website whitelist management
- ✅ Settings persistence across browser sessions
- ✅ Dynamic content handling (SPAs, AJAX)
- ✅ Accessibility features

## Troubleshooting

### Extension Not Loading

- Ensure you're using Chrome 88+ (Manifest V3 support)
- Check that the `dist` folder contains all required files
- Try refreshing the extensions page

### Dark Mode Not Working

- Check if the website is in the whitelist
- Refresh the page after enabling dark mode
- Check browser console for any errors

### Settings Not Saving

- Ensure Chrome sync is enabled
- Try clearing extension storage and reconfiguring

## Development

### Watch Mode

For development, use watch mode to automatically rebuild:

```bash
pnpm run watch
```

### Manual Testing

Test on various website types:

- News sites (CNN, BBC)
- Social media (Twitter, Facebook)
- E-commerce (Amazon, eBay)
- Web apps (Gmail, Google Docs)

## Next Steps

1. **Create proper icons**: Replace placeholder SVG files with actual PNG icons
2. **Add tests**: Implement automated testing
3. **Optimize performance**: Profile and optimize CSS injection
4. **Publish to Chrome Web Store**: Prepare for public release

## File Structure

```
dist/
├── manifest.json          # Extension manifest
├── background.js          # Service worker
├── content.js            # Content script
├── popup.js              # Popup logic
├── popup.css             # Popup styles
├── storage.js            # Storage utilities
└── icons/                # Extension icons
    ├── icon16.png
    ├── icon48.png
    ├── icon128.png
    └── icon48-disabled.png
```

## Browser Compatibility

- ✅ Chrome 88+
- ✅ Edge 88+ (Chromium-based)
- ✅ Opera 74+ (Chromium-based)
- ❌ Firefox (requires different manifest)
- ❌ Safari (requires different approach)

---

**The extension is now ready to use!** 🎉
