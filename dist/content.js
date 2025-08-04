var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
class ThemeGenerator {
  static generateCSS(intensity, highContrast = false) {
    const colors = this.THEME_COLORS[intensity];
    if (highContrast) {
      colors.background = "#000000";
      colors.text = "#ffffff";
      colors.border = "#ffffff";
    }
    return `
      :root {
        --dm-background: ${colors.background} !important;
        --dm-text: ${colors.text} !important;
        --dm-link: ${colors.link} !important;
        --dm-border: ${colors.border} !important;
        --dm-shadow: ${colors.shadow} !important;
        --dm-highlight: ${colors.highlight} !important;
      }

      /* Global dark mode styles */
      html, body {
        background-color: var(--dm-background) !important;
        color: var(--dm-text) !important;
      }

      /* Text elements */
      h1, h2, h3, h4, h5, h6, p, span, div, a, li, td, th {
        color: var(--dm-text) !important;
      }

      /* Links */
      a {
        color: var(--dm-link) !important;
      }

      a:hover {
        color: ${this.adjustBrightness(colors.link, 20)} !important;
      }

      /* Backgrounds */
      * {
        background-color: var(--dm-background) !important;
      }

      /* Borders */
      * {
        border-color: var(--dm-border) !important;
      }

      /* Shadows */
      * {
        box-shadow: 0 2px 4px var(--dm-shadow) !important;
      }

      /* Form elements */
      input, textarea, select, button {
        background-color: var(--dm-background) !important;
        color: var(--dm-text) !important;
        border-color: var(--dm-border) !important;
      }

      /* Images and media */
      img, video, canvas {
        filter: ${intensity === "very-dark" ? "brightness(0.8) contrast(1.2)" : "none"} !important;
      }

      /* Scrollbars */
      ::-webkit-scrollbar {
        background-color: var(--dm-background) !important;
      }

      ::-webkit-scrollbar-thumb {
        background-color: var(--dm-border) !important;
      }

      /* Selection */
      ::selection {
        background-color: var(--dm-highlight) !important;
        color: var(--dm-text) !important;
      }

      /* Focus states */
      *:focus {
        outline-color: var(--dm-link) !important;
      }
    `;
  }
  static adjustBrightness(color, percent) {
    if (color.startsWith("#")) {
      const num = parseInt(color.replace("#", ""), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) + amt;
      const G = (num >> 8 & 255) + amt;
      const B = (num & 255) + amt;
      return "#" + (16777216 + (R < 255 ? R < 1 ? 0 : R : 255) * 65536 + (G < 255 ? G < 1 ? 0 : G : 255) * 256 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    return color;
  }
  static generateFontSizeCSS(fontSize) {
    const sizes = {
      "normal": "1rem",
      "large": "1.2rem",
      "extra-large": "1.5rem"
    };
    return `
      body, html {
        font-size: ${sizes[fontSize] || "1rem"} !important;
      }
    `;
  }
}
__publicField(ThemeGenerator, "THEME_COLORS", {
  "light": {
    background: "#f8f9fa",
    text: "#212529",
    link: "#007bff",
    border: "#dee2e6",
    shadow: "rgba(0, 0, 0, 0.1)",
    highlight: "#e3f2fd"
  },
  "medium": {
    background: "#343a40",
    text: "#f8f9fa",
    link: "#6ea8fe",
    border: "#495057",
    shadow: "rgba(0, 0, 0, 0.3)",
    highlight: "#495057"
  },
  "dark": {
    background: "#212529",
    text: "#f8f9fa",
    link: "#4dabf7",
    border: "#343a40",
    shadow: "rgba(0, 0, 0, 0.5)",
    highlight: "#343a40"
  },
  "very-dark": {
    background: "#000000",
    text: "#ffffff",
    link: "#339af0",
    border: "#1a1a1a",
    shadow: "rgba(0, 0, 0, 0.7)",
    highlight: "#1a1a1a"
  }
});
class ExtensionStorageManager {
  static getSettings() {
    return __async(this, null, function* () {
      try {
        const result = yield chrome.storage.sync.get("darkModeSettings");
        return __spreadValues(__spreadValues({}, this.DEFAULT_SETTINGS), result.darkModeSettings);
      } catch (error) {
        console.error("Error getting settings:", error);
        return this.DEFAULT_SETTINGS;
      }
    });
  }
  static saveSettings(settings) {
    return __async(this, null, function* () {
      try {
        const currentSettings = yield this.getSettings();
        const newSettings = __spreadValues(__spreadValues({}, currentSettings), settings);
        yield chrome.storage.sync.set({ darkModeSettings: newSettings });
      } catch (error) {
        console.error("Error saving settings:", error);
      }
    });
  }
  static isWhitelisted(url) {
    return __async(this, null, function* () {
      try {
        const settings = yield this.getSettings();
        return settings.whitelist.some((pattern) => {
          if (pattern.startsWith("*.")) {
            const domain = pattern.slice(2);
            return url.includes(domain);
          }
          return url.includes(pattern);
        });
      } catch (error) {
        console.error("Error checking whitelist:", error);
        return false;
      }
    });
  }
}
__publicField(ExtensionStorageManager, "DEFAULT_SETTINGS", {
  enabled: true,
  intensity: "dark",
  preserveImages: true,
  highContrast: false,
  fontSize: "normal",
  whitelist: []
});
class DarkModeManager {
  constructor() {
    __publicField(this, "styleElement", null);
    __publicField(this, "observer", null);
    __publicField(this, "isEnabled", false);
    this.init();
  }
  init() {
    return __async(this, null, function* () {
      try {
        const settings = yield ExtensionStorageManager.getSettings();
        this.isEnabled = settings.enabled;
        if (this.isEnabled && !(yield ExtensionStorageManager.isWhitelisted(window.location.href))) {
          this.applyDarkMode(settings);
          this.setupObserver();
        }
      } catch (error) {
        console.error("Error initializing dark mode:", error);
      }
    });
  }
  applyDarkMode(settings) {
    if (this.styleElement) {
      this.styleElement.remove();
    }
    this.styleElement = document.createElement("style");
    this.styleElement.id = "dark-mode-extension-styles";
    this.styleElement.setAttribute("data-extension", "dark-mode-for-all");
    let css = ThemeGenerator.generateCSS(
      settings.intensity,
      settings.highContrast
    );
    if (settings.fontSize !== "normal") {
      css += ThemeGenerator.generateFontSizeCSS(settings.fontSize);
    }
    if (settings.preserveImages) {
      css += `
        img, video, canvas {
          filter: none !important;
        }
      `;
    }
    this.styleElement.textContent = css;
    if (document.head) {
      document.head.appendChild(this.styleElement);
    } else {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList" && document.head) {
            document.head.appendChild(this.styleElement);
            observer.disconnect();
          }
        });
      });
      observer.observe(document.documentElement, { childList: true });
    }
  }
  setupObserver() {
    this.observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node;
              if (this.needsStyling(element)) {
                shouldUpdate = true;
              }
            }
          });
        }
      });
      if (shouldUpdate) {
        this.updateStyles();
      }
    });
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  needsStyling(element) {
    const selectors = [
      "div",
      "span",
      "p",
      "a",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "input",
      "button"
    ];
    return selectors.some((selector) => element.matches(selector));
  }
  updateStyles() {
    if (this.styleElement) {
      const currentCSS = this.styleElement.textContent;
      this.styleElement.textContent = "";
      setTimeout(() => {
        if (this.styleElement) {
          this.styleElement.textContent = currentCSS;
        }
      }, 0);
    }
  }
  updateSettings(settings) {
    return __async(this, null, function* () {
      try {
        yield ExtensionStorageManager.saveSettings(settings);
        if (settings.enabled !== void 0) {
          this.isEnabled = settings.enabled;
        }
        if (this.isEnabled && !(yield ExtensionStorageManager.isWhitelisted(window.location.href))) {
          const currentSettings = yield ExtensionStorageManager.getSettings();
          this.applyDarkMode(currentSettings);
        } else if (!this.isEnabled) {
          this.removeDarkMode();
        }
      } catch (error) {
        console.error("Error updating settings:", error);
      }
    });
  }
  removeDarkMode() {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
  destroy() {
    this.removeDarkMode();
  }
}
const darkModeManager = new DarkModeManager();
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "UPDATE_SETTINGS") {
    darkModeManager.updateSettings(message.settings);
    sendResponse({ success: true });
  } else if (message.type === "TOGGLE_DARK_MODE") {
    darkModeManager.updateSettings({ enabled: message.enabled });
    sendResponse({ success: true });
  }
  return true;
});
window.addEventListener("beforeunload", () => {
  darkModeManager.destroy();
});
