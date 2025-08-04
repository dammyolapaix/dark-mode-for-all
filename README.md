# Dark Mode For All - Chrome Extension

A Chrome extension that forces dark mode on any website, even if the website doesn't have dark mode support. Designed with accessibility in mind for users with eye problems.

## Features

### 🌙 **Universal Dark Mode**
- Force dark mode on any website
- Works even if the website doesn't have dark mode support
- Intelligent CSS injection that preserves functionality

### 🎛️ **Customizable Settings**
- **Darkness Levels**: Light, Medium, Dark, Very Dark
- **High Contrast Mode**: Enhanced visibility for accessibility
- **Font Size Options**: Normal, Large, Extra Large
- **Image Preservation**: Keep original image colors or apply filters

### 🚫 **Website Whitelist**
- Exclude specific websites from dark mode
- Easy-to-use whitelist management
- Pattern matching for domains

### ♿ **Accessibility Features**
- High contrast mode for better visibility
- Adjustable font sizes
- Preserved focus states and keyboard navigation
- Screen reader compatible

## Installation

### Development Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dark-mode-extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Production Installation

1. Download the extension from Chrome Web Store (when available)
2. Or build and install manually using the development steps above

## Development

### Project Structure

```
dark-mode-extension/
├── src/
│   ├── content-scripts/
│   │   └── dark-mode.ts          # Main dark mode logic
│   ├── background/
│   │   └── background.ts         # Service worker
│   ├── popup/
│   │   ├── popup.html           # Settings UI
│   │   ├── popup.css            # Popup styles
│   │   └── popup.ts             # Popup logic
│   ├── utils/
│   │   ├── theme-generator.ts   # CSS generation
│   │   └── storage.ts           # Settings management
│   └── types/
│       └── index.ts             # TypeScript types
├── icons/                       # Extension icons
├── dist/                        # Built extension
├── manifest.json                # Extension manifest
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript config
└── vite.config.ts              # Build configuration
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run watch` - Build and watch for changes
- `npm run preview` - Preview built extension

### Technology Stack

- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool
- **Chrome Extension APIs** - Native browser APIs
- **CSS-in-JS** - Dynamic styling
- **Modern JavaScript** - ES6+ features

## How It Works

### 1. **Content Script Injection**
The extension injects a content script into every webpage that:
- Checks if dark mode should be applied
- Injects custom CSS with dark theme variables
- Monitors DOM changes for dynamic content

### 2. **CSS Generation**
The theme generator creates CSS that:
- Overrides website colors with dark theme variables
- Uses `!important` declarations to ensure override
- Preserves important UI elements and functionality

### 3. **Settings Management**
Settings are stored in Chrome's sync storage and include:
- Dark mode enabled/disabled
- Darkness intensity level
- Accessibility options
- Website whitelist

### 4. **Dynamic Updates**
The extension monitors for:
- DOM changes (SPAs, AJAX content)
- Settings changes
- Tab updates

## Usage

### Basic Usage

1. **Enable Dark Mode**: Click the extension icon and toggle "Enable Dark Mode"
2. **Adjust Settings**: Use the popup to customize darkness level and accessibility options
3. **Whitelist Websites**: Add websites you want to exclude from dark mode

### Advanced Features

- **High Contrast Mode**: Enable for better visibility
- **Font Size**: Increase text size for better readability
- **Image Preservation**: Keep original image colors or apply dark filters

## Browser Compatibility

- **Chrome**: 88+ (Manifest V3)
- **Edge**: 88+ (Chromium-based)
- **Opera**: 74+ (Chromium-based)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Test on various website types
- Ensure accessibility compliance

## Testing

### Manual Testing

Test the extension on various website types:
- **News sites**: CNN, BBC, Reuters
- **Social media**: Twitter, Facebook, LinkedIn
- **E-commerce**: Amazon, eBay, Shopify sites
- **Web applications**: Gmail, Google Docs, Notion
- **Complex layouts**: GitHub, Stack Overflow

### Automated Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint
```

## Troubleshooting

### Common Issues

1. **Dark mode not working on a site**
   - Check if the site is in the whitelist
   - Try refreshing the page
   - Check browser console for errors

2. **Extension not loading**
   - Ensure you're using a compatible browser
   - Check if the extension is enabled
   - Try reinstalling the extension

3. **Settings not saving**
   - Check Chrome sync settings
   - Clear extension storage and reconfigure

### Debug Mode

Enable debug logging by:
1. Opening Chrome DevTools
2. Going to the Console tab
3. Looking for "Dark Mode For All" messages

## Privacy

This extension:
- ✅ Does not collect personal data
- ✅ Does not track browsing history
- ✅ Stores settings locally and in Chrome sync
- ✅ Does not communicate with external servers
- ✅ Is open source and transparent

## License

MIT License - see LICENSE file for details

## Support

- **Issues**: Report bugs on GitHub
- **Feature Requests**: Submit via GitHub issues
- **Documentation**: Check this README and code comments

## Roadmap

### Planned Features

- [ ] **Scheduled Dark Mode**: Auto-enable at sunset
- [ ] **Custom Color Schemes**: User-defined themes
- [ ] **Keyboard Shortcuts**: Quick toggle and settings
- [ ] **Export/Import Settings**: Backup and restore
- [ ] **Performance Optimizations**: Faster loading
- [ ] **More Browser Support**: Firefox, Safari

### Known Limitations

- Some complex web applications may have styling conflicts
- Dynamic content may require page refresh
- Very old websites might not render perfectly

## Acknowledgments

- Chrome Extension documentation
- TypeScript community
- Accessibility guidelines (WCAG)
- Open source contributors

---

**Made with ❤️ for better web accessibility** 