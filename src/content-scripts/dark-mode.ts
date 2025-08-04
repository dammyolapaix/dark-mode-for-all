// Include utility classes directly to avoid import issues
class ThemeGenerator {
  private static readonly THEME_COLORS = {
    light: {
      background: "#f8f9fa",
      text: "#212529",
      link: "#007bff",
      border: "#dee2e6",
      shadow: "rgba(0, 0, 0, 0.1)",
      highlight: "#e3f2fd",
    },
    medium: {
      background: "#343a40",
      text: "#f8f9fa",
      link: "#6ea8fe",
      border: "#495057",
      shadow: "rgba(0, 0, 0, 0.3)",
      highlight: "#495057",
    },
    dark: {
      background: "#212529",
      text: "#f8f9fa",
      link: "#4dabf7",
      border: "#343a40",
      shadow: "rgba(0, 0, 0, 0.5)",
      highlight: "#343a40",
    },
    "very-dark": {
      background: "#000000",
      text: "#ffffff",
      link: "#339af0",
      border: "#1a1a1a",
      shadow: "rgba(0, 0, 0, 0.7)",
      highlight: "#1a1a1a",
    },
  };

  static generateCSS(intensity: string, highContrast: boolean = false): string {
    const colors =
      this.THEME_COLORS[intensity as keyof typeof this.THEME_COLORS];

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
        filter: ${
          intensity === "very-dark" ? "brightness(0.8) contrast(1.2)" : "none"
        } !important;
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

  private static adjustBrightness(color: string, percent: number): string {
    if (color.startsWith("#")) {
      const num = parseInt(color.replace("#", ""), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) + amt;
      const G = ((num >> 8) & 0x00ff) + amt;
      const B = (num & 0x0000ff) + amt;
      return (
        "#" +
        (
          0x1000000 +
          (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
          (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
          (B < 255 ? (B < 1 ? 0 : B) : 255)
        )
          .toString(16)
          .slice(1)
      );
    }
    return color;
  }

  static generateFontSizeCSS(fontSize: string): string {
    const sizes = {
      normal: "1rem",
      large: "1.2rem",
      "extra-large": "1.5rem",
    };

    return `
      body, html {
        font-size: ${
          sizes[fontSize as keyof typeof sizes] || "1rem"
        } !important;
      }
    `;
  }
}

class ExtensionStorageManager {
  private static readonly DEFAULT_SETTINGS = {
    enabled: true,
    intensity: "dark",
    preserveImages: true,
    highContrast: false,
    fontSize: "normal",
    whitelist: [],
  };

  static async getSettings(): Promise<any> {
    try {
      const result = await chrome.storage.sync.get("darkModeSettings");
      return { ...this.DEFAULT_SETTINGS, ...result.darkModeSettings };
    } catch (error) {
      console.error("Error getting settings:", error);
      return this.DEFAULT_SETTINGS;
    }
  }

  static async saveSettings(settings: any): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      await chrome.storage.sync.set({ darkModeSettings: newSettings });
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  }

  static async isWhitelisted(url: string): Promise<boolean> {
    try {
      const settings = await this.getSettings();
      return settings.whitelist.some((pattern: string) => {
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
  }
}

class DarkModeManager {
  private styleElement: HTMLStyleElement | null = null;
  private observer: MutationObserver | null = null;
  private isEnabled = false;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    try {
      const settings = await ExtensionStorageManager.getSettings();
      this.isEnabled = settings.enabled;

      if (
        this.isEnabled &&
        !(await ExtensionStorageManager.isWhitelisted(window.location.href))
      ) {
        this.applyDarkMode(settings);
        this.setupObserver();
      }
    } catch (error) {
      console.error("Error initializing dark mode:", error);
    }
  }

  private applyDarkMode(settings: any): void {
    // Remove existing style element if present
    if (this.styleElement) {
      this.styleElement.remove();
    }

    // Create new style element
    this.styleElement = document.createElement("style");
    this.styleElement.id = "dark-mode-extension-styles";
    this.styleElement.setAttribute("data-extension", "dark-mode-for-all");

    // Generate CSS based on settings
    let css = ThemeGenerator.generateCSS(
      settings.intensity,
      settings.highContrast
    );

    if (settings.fontSize !== "normal") {
      css += ThemeGenerator.generateFontSizeCSS(settings.fontSize);
    }

    // Add image preservation if enabled
    if (settings.preserveImages) {
      css += `
        img, video, canvas {
          filter: none !important;
        }
      `;
    }

    this.styleElement.textContent = css;

    // Inject styles as early as possible
    if (document.head) {
      document.head.appendChild(this.styleElement);
    } else {
      // If head doesn't exist yet, wait for it
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList" && document.head) {
            document.head.appendChild(this.styleElement!);
            observer.disconnect();
          }
        });
      });
      observer.observe(document.documentElement, { childList: true });
    }
  }

  private setupObserver(): void {
    // Watch for dynamic content changes
    this.observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              // Check if new elements need styling
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
      subtree: true,
    });
  }

  private needsStyling(element: Element): boolean {
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
      "button",
    ];
    return selectors.some((selector) => element.matches(selector));
  }

  private updateStyles(): void {
    // Force a reflow to ensure new elements get styled
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

  public async updateSettings(settings: any): Promise<void> {
    try {
      await ExtensionStorageManager.saveSettings(settings);

      if (settings.enabled !== undefined) {
        this.isEnabled = settings.enabled;
      }

      if (
        this.isEnabled &&
        !(await ExtensionStorageManager.isWhitelisted(window.location.href))
      ) {
        const currentSettings = await ExtensionStorageManager.getSettings();
        this.applyDarkMode(currentSettings);
      } else if (!this.isEnabled) {
        this.removeDarkMode();
      }
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  }

  public removeDarkMode(): void {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  public destroy(): void {
    this.removeDarkMode();
  }
}

// Initialize dark mode manager
const darkModeManager = new DarkModeManager();

// Listen for messages from popup or background script
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

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  darkModeManager.destroy();
});
