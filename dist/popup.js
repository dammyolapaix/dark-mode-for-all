var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
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
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
class PopupManager {
  constructor() {
    __publicField(this, "settings", null);
    this.init();
  }
  init() {
    return __async(this, null, function* () {
      yield this.loadSettings();
      this.setupEventListeners();
      this.updateUI();
    });
  }
  loadSettings() {
    return __async(this, null, function* () {
      try {
        const response = yield chrome.runtime.sendMessage({
          type: "GET_SETTINGS"
        });
        this.settings = response.settings;
      } catch (error) {
        console.error("Error loading settings:", error);
        this.settings = {
          enabled: true,
          intensity: "dark",
          preserveImages: true,
          highContrast: false,
          fontSize: "normal",
          whitelist: []
        };
      }
    });
  }
  setupEventListeners() {
    const darkModeToggle = document.getElementById(
      "darkModeToggle"
    );
    darkModeToggle == null ? void 0 : darkModeToggle.addEventListener("change", (e) => {
      const target = e.target;
      this.updateSetting("enabled", target.checked);
    });
    const intensityRadios = document.querySelectorAll(
      'input[name="intensity"]'
    );
    intensityRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        const target = e.target;
        this.updateSetting("intensity", target.value);
      });
    });
    const fontSizeRadios = document.querySelectorAll('input[name="fontSize"]');
    fontSizeRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        const target = e.target;
        this.updateSetting("fontSize", target.value);
      });
    });
    const highContrastCheckbox = document.getElementById(
      "highContrast"
    );
    highContrastCheckbox == null ? void 0 : highContrastCheckbox.addEventListener("change", (e) => {
      const target = e.target;
      this.updateSetting("highContrast", target.checked);
    });
    const preserveImagesCheckbox = document.getElementById(
      "preserveImages"
    );
    preserveImagesCheckbox == null ? void 0 : preserveImagesCheckbox.addEventListener("change", (e) => {
      const target = e.target;
      this.updateSetting("preserveImages", target.checked);
    });
    const addWhitelistBtn = document.getElementById("addWhitelist");
    const whitelistInput = document.getElementById(
      "whitelistInput"
    );
    addWhitelistBtn == null ? void 0 : addWhitelistBtn.addEventListener("click", () => {
      const value = whitelistInput.value.trim();
      if (value) {
        this.addToWhitelist(value);
        whitelistInput.value = "";
      }
    });
    whitelistInput == null ? void 0 : whitelistInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const value = whitelistInput.value.trim();
        if (value) {
          this.addToWhitelist(value);
          whitelistInput.value = "";
        }
      }
    });
    const resetBtn = document.getElementById("resetSettings");
    resetBtn == null ? void 0 : resetBtn.addEventListener("click", () => {
      this.resetToDefaults();
    });
  }
  updateUI() {
    if (!this.settings) return;
    const darkModeToggle = document.getElementById(
      "darkModeToggle"
    );
    if (darkModeToggle) {
      darkModeToggle.checked = this.settings.enabled;
    }
    const intensityRadio = document.querySelector(
      `input[name="intensity"][value="${this.settings.intensity}"]`
    );
    if (intensityRadio) {
      intensityRadio.checked = true;
    }
    const fontSizeRadio = document.querySelector(
      `input[name="fontSize"][value="${this.settings.fontSize}"]`
    );
    if (fontSizeRadio) {
      fontSizeRadio.checked = true;
    }
    const highContrastCheckbox = document.getElementById(
      "highContrast"
    );
    if (highContrastCheckbox) {
      highContrastCheckbox.checked = this.settings.highContrast;
    }
    const preserveImagesCheckbox = document.getElementById(
      "preserveImages"
    );
    if (preserveImagesCheckbox) {
      preserveImagesCheckbox.checked = this.settings.preserveImages;
    }
    this.updateWhitelistUI();
  }
  updateSetting(key, value) {
    return __async(this, null, function* () {
      if (!this.settings) return;
      this.settings[key] = value;
      try {
        yield chrome.runtime.sendMessage({
          type: "SAVE_SETTINGS",
          settings: this.settings
        });
      } catch (error) {
        console.error("Error saving settings:", error);
      }
    });
  }
  addToWhitelist(pattern) {
    return __async(this, null, function* () {
      if (!this.settings) return;
      if (!pattern || pattern.length < 2) {
        this.showError("Please enter a valid domain name");
        return;
      }
      let cleanPattern = pattern.toLowerCase();
      if (cleanPattern.startsWith("http://") || cleanPattern.startsWith("https://")) {
        cleanPattern = cleanPattern.replace(/^https?:\/\//, "");
      }
      if (cleanPattern.startsWith("www.")) {
        cleanPattern = cleanPattern.replace(/^www\./, "");
      }
      if (this.settings.whitelist.includes(cleanPattern)) {
        this.showError("This website is already in the whitelist");
        return;
      }
      this.settings.whitelist.push(cleanPattern);
      yield this.updateSetting("whitelist", this.settings.whitelist);
      this.updateWhitelistUI();
    });
  }
  removeFromWhitelist(pattern) {
    return __async(this, null, function* () {
      if (!this.settings) return;
      this.settings.whitelist = this.settings.whitelist.filter(
        (p) => p !== pattern
      );
      yield this.updateSetting("whitelist", this.settings.whitelist);
      this.updateWhitelistUI();
    });
  }
  updateWhitelistUI() {
    const whitelistContainer = document.getElementById("whitelistItems");
    if (!whitelistContainer || !this.settings) return;
    whitelistContainer.innerHTML = "";
    if (this.settings.whitelist.length === 0) {
      whitelistContainer.innerHTML = '<div style="color: #6c757d; font-style: italic; text-align: center; padding: 10px;">No websites whitelisted</div>';
      return;
    }
    this.settings.whitelist.forEach((pattern) => {
      const item = document.createElement("div");
      item.className = "whitelist-item";
      item.innerHTML = `
        <span>${pattern}</span>
        <button class="remove-whitelist" data-pattern="${pattern}">×</button>
      `;
      const removeBtn = item.querySelector(".remove-whitelist");
      removeBtn == null ? void 0 : removeBtn.addEventListener("click", () => {
        this.removeFromWhitelist(pattern);
      });
      whitelistContainer.appendChild(item);
    });
  }
  resetToDefaults() {
    return __async(this, null, function* () {
      const defaultSettings = {
        enabled: true,
        intensity: "dark",
        preserveImages: true,
        highContrast: false,
        fontSize: "normal",
        whitelist: []
      };
      this.settings = defaultSettings;
      yield this.updateSetting("enabled", true);
      yield this.updateSetting("intensity", "dark");
      yield this.updateSetting("preserveImages", true);
      yield this.updateSetting("highContrast", false);
      yield this.updateSetting("fontSize", "normal");
      yield this.updateSetting("whitelist", []);
      this.updateUI();
      this.showSuccess("Settings reset to defaults");
    });
  }
  showError(message) {
    console.error(message);
  }
  showSuccess(message) {
    console.log(message);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  new PopupManager();
});
