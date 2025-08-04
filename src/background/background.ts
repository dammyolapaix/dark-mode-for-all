// Include storage manager directly to avoid import issues
class BackgroundStorageManager {
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

  static async getWebsiteOverrides(): Promise<any[]> {
    try {
      const result = await chrome.storage.sync.get("websiteOverrides");
      return result.websiteOverrides || [];
    } catch (error) {
      console.error("Error getting website overrides:", error);
      return [];
    }
  }

  static async saveWebsiteOverride(override: any): Promise<void> {
    try {
      const overrides = await this.getWebsiteOverrides();
      const existingIndex = overrides.findIndex((o) => o.url === override.url);
      
      if (existingIndex >= 0) {
        overrides[existingIndex] = override;
      } else {
        overrides.push(override);
      }
      
      await chrome.storage.sync.set({ websiteOverrides: overrides });
    } catch (error) {
      console.error("Error saving website override:", error);
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

class BackgroundManager {
  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    // Set up message listeners
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));

    // Handle extension installation
    chrome.runtime.onInstalled.addListener(this.handleInstallation.bind(this));

    // Handle tab updates
    chrome.tabs.onUpdated.addListener(this.handleTabUpdate.bind(this));

    // Handle extension action clicks
    chrome.action.onClicked.addListener(this.handleActionClick.bind(this));
  }

  private async handleMessage(
    message: any,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    try {
      switch (message.type) {
        case "GET_SETTINGS":
          const settings = await BackgroundStorageManager.getSettings();
          sendResponse({ settings });
          break;

        case "SAVE_SETTINGS":
          await BackgroundStorageManager.saveSettings(message.settings);
          await this.notifyContentScripts(message.settings);
          sendResponse({ success: true });
          break;

        case "GET_WEBSITE_OVERRIDES":
          const overrides = await BackgroundStorageManager.getWebsiteOverrides();
          sendResponse({ overrides });
          break;

        case "SAVE_WEBSITE_OVERRIDE":
          await BackgroundStorageManager.saveWebsiteOverride(message.override);
          sendResponse({ success: true });
          break;

        case "TOGGLE_DARK_MODE":
          await this.toggleDarkMode(message.enabled);
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ error: "Unknown message type" });
      }
    } catch (error) {
      console.error("Error handling message:", error);
      sendResponse({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  private async handleInstallation(
    details: chrome.runtime.InstalledDetails
  ): Promise<void> {
    if (details.reason === "install") {
      // Set default settings on first install
      const defaultSettings: any = {
        enabled: true,
        intensity: "dark",
        preserveImages: true,
        highContrast: false,
        fontSize: "normal",
        whitelist: [],
      };

      await BackgroundStorageManager.saveSettings(defaultSettings);

      // Open welcome page
      chrome.tabs.create({
        url: chrome.runtime.getURL("welcome.html"),
      });
    }
  }

  private async handleTabUpdate(
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
  ): Promise<void> {
    if (changeInfo.status === "complete" && tab.url) {
      // Check if dark mode should be applied to this tab
      const settings = await BackgroundStorageManager.getSettings();
      const isWhitelisted = await BackgroundStorageManager.isWhitelisted(tab.url);

      if (settings.enabled && !isWhitelisted) {
        // Inject content script if not already injected
        try {
          await chrome.scripting.executeScript({
            target: { tabId },
            files: ["content.js"],
          });
        } catch (error) {
          // Script might already be injected, ignore error
        }
      }
    }
  }

  private async handleActionClick(tab: chrome.tabs.Tab): Promise<void> {
    if (tab.id) {
      // Toggle dark mode for the current tab
      const settings = await BackgroundStorageManager.getSettings();
      const newEnabled = !settings.enabled;

      await this.toggleDarkMode(newEnabled);

      // Update the action icon
      this.updateActionIcon(newEnabled);
    }
  }

  private async toggleDarkMode(enabled: boolean): Promise<void> {
        const settings = await BackgroundStorageManager.getSettings();
    settings.enabled = enabled;
    
    await BackgroundStorageManager.saveSettings(settings);
    await this.notifyContentScripts(settings);
    this.updateActionIcon(enabled);
  }

  private async notifyContentScripts(
    settings: any
  ): Promise<void> {
    try {
      const tabs = await chrome.tabs.query({});

      for (const tab of tabs) {
        if (tab.id && tab.url && !tab.url.startsWith("chrome://")) {
          try {
            await chrome.tabs.sendMessage(tab.id, {
              type: "UPDATE_SETTINGS",
              settings,
            });
          } catch (error) {
            // Content script might not be loaded, ignore error
          }
        }
      }
    } catch (error) {
      console.error("Error notifying content scripts:", error);
    }
  }

  private updateActionIcon(enabled: boolean): void {
    const iconPath = enabled ? "icons/icon48.png" : "icons/icon48-disabled.png";
    chrome.action.setIcon({ path: iconPath });

    const title = enabled
      ? "Dark Mode For All (Enabled)"
      : "Dark Mode For All (Disabled)";
    chrome.action.setTitle({ title });
  }
}

// Initialize background manager
new BackgroundManager();
