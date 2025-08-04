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
class StorageManager {
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
  static getWebsiteOverrides() {
    return __async(this, null, function* () {
      try {
        const result = yield chrome.storage.sync.get("websiteOverrides");
        return result.websiteOverrides || [];
      } catch (error) {
        console.error("Error getting website overrides:", error);
        return [];
      }
    });
  }
  static saveWebsiteOverride(override) {
    return __async(this, null, function* () {
      try {
        const overrides = yield this.getWebsiteOverrides();
        const existingIndex = overrides.findIndex((o) => o.url === override.url);
        if (existingIndex >= 0) {
          overrides[existingIndex] = override;
        } else {
          overrides.push(override);
        }
        yield chrome.storage.sync.set({ websiteOverrides: overrides });
      } catch (error) {
        console.error("Error saving website override:", error);
      }
    });
  }
  static removeWebsiteOverride(url) {
    return __async(this, null, function* () {
      try {
        const overrides = yield this.getWebsiteOverrides();
        const filteredOverrides = overrides.filter((o) => o.url !== url);
        yield chrome.storage.sync.set({ websiteOverrides: filteredOverrides });
      } catch (error) {
        console.error("Error removing website override:", error);
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
  static addToWhitelist(pattern) {
    return __async(this, null, function* () {
      try {
        const settings = yield this.getSettings();
        if (!settings.whitelist.includes(pattern)) {
          settings.whitelist.push(pattern);
          yield this.saveSettings(settings);
        }
      } catch (error) {
        console.error("Error adding to whitelist:", error);
      }
    });
  }
  static removeFromWhitelist(pattern) {
    return __async(this, null, function* () {
      try {
        const settings = yield this.getSettings();
        settings.whitelist = settings.whitelist.filter((p) => p !== pattern);
        yield this.saveSettings(settings);
      } catch (error) {
        console.error("Error removing from whitelist:", error);
      }
    });
  }
}
__publicField(StorageManager, "DEFAULT_SETTINGS", {
  enabled: true,
  intensity: "dark",
  preserveImages: true,
  highContrast: false,
  fontSize: "normal",
  whitelist: []
});
class BackgroundManager {
  constructor() {
    this.init();
  }
  init() {
    return __async(this, null, function* () {
      chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
      chrome.runtime.onInstalled.addListener(this.handleInstallation.bind(this));
      chrome.tabs.onUpdated.addListener(this.handleTabUpdate.bind(this));
      chrome.action.onClicked.addListener(this.handleActionClick.bind(this));
    });
  }
  handleMessage(message, _sender, sendResponse) {
    return __async(this, null, function* () {
      try {
        switch (message.type) {
          case "GET_SETTINGS":
            const settings = yield StorageManager.getSettings();
            sendResponse({ settings });
            break;
          case "SAVE_SETTINGS":
            yield StorageManager.saveSettings(message.settings);
            yield this.notifyContentScripts(message.settings);
            sendResponse({ success: true });
            break;
          case "GET_WEBSITE_OVERRIDES":
            const overrides = yield StorageManager.getWebsiteOverrides();
            sendResponse({ overrides });
            break;
          case "SAVE_WEBSITE_OVERRIDE":
            yield StorageManager.saveWebsiteOverride(message.override);
            sendResponse({ success: true });
            break;
          case "TOGGLE_DARK_MODE":
            yield this.toggleDarkMode(message.enabled);
            sendResponse({ success: true });
            break;
          default:
            sendResponse({ error: "Unknown message type" });
        }
      } catch (error) {
        console.error("Error handling message:", error);
        sendResponse({
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });
  }
  handleInstallation(details) {
    return __async(this, null, function* () {
      if (details.reason === "install") {
        const defaultSettings = {
          enabled: true,
          intensity: "dark",
          preserveImages: true,
          highContrast: false,
          fontSize: "normal",
          whitelist: []
        };
        yield StorageManager.saveSettings(defaultSettings);
        chrome.tabs.create({
          url: chrome.runtime.getURL("welcome.html")
        });
      }
    });
  }
  handleTabUpdate(tabId, changeInfo, tab) {
    return __async(this, null, function* () {
      if (changeInfo.status === "complete" && tab.url) {
        const settings = yield StorageManager.getSettings();
        const isWhitelisted = yield StorageManager.isWhitelisted(tab.url);
        if (settings.enabled && !isWhitelisted) {
          try {
            yield chrome.scripting.executeScript({
              target: { tabId },
              files: ["content.js"]
            });
          } catch (error) {
          }
        }
      }
    });
  }
  handleActionClick(tab) {
    return __async(this, null, function* () {
      if (tab.id) {
        const settings = yield StorageManager.getSettings();
        const newEnabled = !settings.enabled;
        yield this.toggleDarkMode(newEnabled);
        this.updateActionIcon(newEnabled);
      }
    });
  }
  toggleDarkMode(enabled) {
    return __async(this, null, function* () {
      const settings = yield StorageManager.getSettings();
      settings.enabled = enabled;
      yield StorageManager.saveSettings(settings);
      yield this.notifyContentScripts(settings);
      this.updateActionIcon(enabled);
    });
  }
  notifyContentScripts(settings) {
    return __async(this, null, function* () {
      try {
        const tabs = yield chrome.tabs.query({});
        for (const tab of tabs) {
          if (tab.id && tab.url && !tab.url.startsWith("chrome://")) {
            try {
              yield chrome.tabs.sendMessage(tab.id, {
                type: "UPDATE_SETTINGS",
                settings
              });
            } catch (error) {
            }
          }
        }
      } catch (error) {
        console.error("Error notifying content scripts:", error);
      }
    });
  }
  updateActionIcon(enabled) {
    const iconPath = enabled ? "icons/icon48.png" : "icons/icon48-disabled.png";
    chrome.action.setIcon({ path: iconPath });
    const title = enabled ? "Dark Mode For All (Enabled)" : "Dark Mode For All (Disabled)";
    chrome.action.setTitle({ title });
  }
}
new BackgroundManager();
