# Troubleshooting Guide

## Common Errors and Solutions

### 1. "The default_popup file in the manifest doesn't exist"

**Error**: Chrome can't find the popup.html file specified in the manifest.

**Solution**:

- Ensure `popup.html` is in the root of the `dist` folder
- Run `pnpm run build` to rebuild the extension
- Check that the file path in manifest.json matches the actual file location

**Fixed**: ✅ The build process now automatically copies `popup.html` to the correct location.

### 2. "Service worker registration failed. Status code: 15"

**Error**: Chrome can't register the background service worker.

**Solution**:

- Ensure `background.js` exists in the `dist` folder
- Check that the manifest.json references the correct file path
- Verify the service worker code doesn't have syntax errors

**Fixed**: ✅ The background.js file is properly built and placed in the dist folder.

### 3. Extension Not Loading

**Symptoms**: Extension appears in Chrome but doesn't function properly.

**Solutions**:

1. **Reload the extension**:

   - Go to `chrome://extensions/`
   - Click the refresh icon on the extension
   - Or click "Load unpacked" again

2. **Check file structure**:

   ```
   dist/
   ├── manifest.json
   ├── popup.html          ← Must be here
   ├── popup.js
   ├── popup.css
   ├── background.js       ← Must be here
   ├── content.js
   ├── storage.js
   └── icons/
       ├── icon16.png
       ├── icon48.png
       ├── icon48-disabled.png
       └── icon128.png
   ```

3. **Clear browser cache**:
   - Clear Chrome's cache and cookies
   - Restart Chrome

### 4. Dark Mode Not Working

**Symptoms**: Extension loads but doesn't apply dark mode to websites.

**Solutions**:

1. **Check if enabled**:

   - Click the extension icon
   - Ensure "Enable Dark Mode" is toggled on

2. **Check whitelist**:

   - The current website might be in the whitelist
   - Remove it from the whitelist if needed

3. **Refresh the page**:

   - Dark mode is applied when the page loads
   - Refresh to see changes

4. **Check console errors**:
   - Open DevTools (F12)
   - Look for errors in the Console tab
   - Check for "Dark Mode For All" messages

### 5. Settings Not Saving

**Symptoms**: Changes in the popup don't persist.

**Solutions**:

1. **Check Chrome sync**:

   - Ensure Chrome sync is enabled
   - Check your Google account settings

2. **Clear extension storage**:

   - Go to `chrome://extensions/`
   - Find the extension
   - Click "Details"
   - Click "Clear data"

3. **Reinstall extension**:
   - Remove the extension
   - Rebuild with `pnpm run build`
   - Load again

### 6. Build Errors

**TypeScript Errors**:

```bash
# Fix TypeScript errors
pnpm run build
```

**Missing Dependencies**:

```bash
# Reinstall dependencies
pnpm install
```

**File Not Found Errors**:

```bash
# Clean and rebuild
rm -rf dist/
pnpm run build
```

## Debug Mode

To enable debug logging:

1. **Open DevTools** on any webpage
2. **Go to Console tab**
3. **Look for messages** starting with "Dark Mode For All"

## Testing Checklist

Before reporting issues, verify:

- [ ] Extension loads without errors in `chrome://extensions/`
- [ ] Popup opens when clicking the extension icon
- [ ] Settings can be changed and saved
- [ ] Dark mode applies to test websites (e.g., google.com)
- [ ] Whitelist functionality works
- [ ] No console errors in DevTools

## Getting Help

If you're still experiencing issues:

1. **Check the console** for error messages
2. **Try on a different website** to isolate the problem
3. **Test with a fresh Chrome profile**
4. **Report the issue** with:
   - Chrome version
   - Error messages
   - Steps to reproduce
   - Website where the issue occurs

## Common Test Websites

Test the extension on these websites:

- ✅ Google.com
- ✅ GitHub.com
- ✅ Stack Overflow
- ✅ CNN.com
- ✅ Twitter.com

---

**Most issues are resolved by rebuilding the extension with `pnpm run build` and reloading it in Chrome.**
