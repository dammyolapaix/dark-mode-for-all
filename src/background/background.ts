import { StorageManager } from "../utils/storage";
import { DarkModeSettings } from "../types";

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
          const settings = await StorageManager.getSettings();
          sendResponse({ settings });
          break;

        case "SAVE_SETTINGS":
          await StorageManager.saveSettings(message.settings);
          await this.notifyContentScripts(message.settings);
          sendResponse({ success: true });
          break;

        case "GET_WEBSITE_OVERRIDES":
          const overrides = await StorageManager.getWebsiteOverrides();
          sendResponse({ overrides });
          break;

        case "SAVE_WEBSITE_OVERRIDE":
          await StorageManager.saveWebsiteOverride(message.override);
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
      const defaultSettings: DarkModeSettings = {
        enabled: true,
        intensity: "dark",
        preserveImages: true,
        highContrast: false,
        fontSize: "normal",
        whitelist: [],
      };

      await StorageManager.saveSettings(defaultSettings);

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
      const settings = await StorageManager.getSettings();
      const isWhitelisted = await StorageManager.isWhitelisted(tab.url);

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
      const settings = await StorageManager.getSettings();
      const newEnabled = !settings.enabled;

      await this.toggleDarkMode(newEnabled);

      // Update the action icon
      this.updateActionIcon(newEnabled);
    }
  }

  private async toggleDarkMode(enabled: boolean): Promise<void> {
    const settings = await StorageManager.getSettings();
    settings.enabled = enabled;

    await StorageManager.saveSettings(settings);
    await this.notifyContentScripts(settings);
    this.updateActionIcon(enabled);
  }

  private async notifyContentScripts(
    settings: DarkModeSettings
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
