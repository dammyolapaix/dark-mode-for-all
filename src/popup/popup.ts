import { DarkModeSettings, IntensityLevel, FontSize } from "../types";

class PopupManager {
  private settings: DarkModeSettings | null = null;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    await this.loadSettings();
    this.setupEventListeners();
    this.updateUI();
  }

  private async loadSettings(): Promise<void> {
    try {
      const response = await chrome.runtime.sendMessage({
        type: "GET_SETTINGS",
      });
      this.settings = response.settings;
    } catch (error) {
      console.error("Error loading settings:", error);
      // Load default settings if communication fails
      this.settings = {
        enabled: true,
        intensity: "dark",
        preserveImages: true,
        highContrast: false,
        fontSize: "normal",
        whitelist: [],
      };
    }
  }

  private setupEventListeners(): void {
    // Main toggle
    const darkModeToggle = document.getElementById(
      "darkModeToggle"
    ) as HTMLInputElement;
    darkModeToggle?.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      this.updateSetting("enabled", target.checked);
    });

    // Intensity radio buttons
    const intensityRadios = document.querySelectorAll(
      'input[name="intensity"]'
    );
    intensityRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        const target = e.target as HTMLInputElement;
        this.updateSetting("intensity", target.value as IntensityLevel);
      });
    });

    // Font size radio buttons
    const fontSizeRadios = document.querySelectorAll('input[name="fontSize"]');
    fontSizeRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        const target = e.target as HTMLInputElement;
        this.updateSetting("fontSize", target.value as FontSize);
      });
    });

    // Checkboxes
    const highContrastCheckbox = document.getElementById(
      "highContrast"
    ) as HTMLInputElement;
    highContrastCheckbox?.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      this.updateSetting("highContrast", target.checked);
    });

    const preserveImagesCheckbox = document.getElementById(
      "preserveImages"
    ) as HTMLInputElement;
    preserveImagesCheckbox?.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      this.updateSetting("preserveImages", target.checked);
    });

    // Whitelist management
    const addWhitelistBtn = document.getElementById("addWhitelist");
    const whitelistInput = document.getElementById(
      "whitelistInput"
    ) as HTMLInputElement;

    addWhitelistBtn?.addEventListener("click", () => {
      const value = whitelistInput.value.trim();
      if (value) {
        this.addToWhitelist(value);
        whitelistInput.value = "";
      }
    });

    whitelistInput?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const value = whitelistInput.value.trim();
        if (value) {
          this.addToWhitelist(value);
          whitelistInput.value = "";
        }
      }
    });

    // Reset settings
    const resetBtn = document.getElementById("resetSettings");
    resetBtn?.addEventListener("click", () => {
      this.resetToDefaults();
    });
  }

  private updateUI(): void {
    if (!this.settings) return;

    // Update main toggle
    const darkModeToggle = document.getElementById(
      "darkModeToggle"
    ) as HTMLInputElement;
    if (darkModeToggle) {
      darkModeToggle.checked = this.settings.enabled;
    }

    // Update intensity radio
    const intensityRadio = document.querySelector(
      `input[name="intensity"][value="${this.settings.intensity}"]`
    ) as HTMLInputElement;
    if (intensityRadio) {
      intensityRadio.checked = true;
    }

    // Update font size radio
    const fontSizeRadio = document.querySelector(
      `input[name="fontSize"][value="${this.settings.fontSize}"]`
    ) as HTMLInputElement;
    if (fontSizeRadio) {
      fontSizeRadio.checked = true;
    }

    // Update checkboxes
    const highContrastCheckbox = document.getElementById(
      "highContrast"
    ) as HTMLInputElement;
    if (highContrastCheckbox) {
      highContrastCheckbox.checked = this.settings.highContrast;
    }

    const preserveImagesCheckbox = document.getElementById(
      "preserveImages"
    ) as HTMLInputElement;
    if (preserveImagesCheckbox) {
      preserveImagesCheckbox.checked = this.settings.preserveImages;
    }

    // Update whitelist
    this.updateWhitelistUI();
  }

  private async updateSetting<K extends keyof DarkModeSettings>(
    key: K,
    value: DarkModeSettings[K]
  ): Promise<void> {
    if (!this.settings) return;

    this.settings[key] = value;

    try {
      await chrome.runtime.sendMessage({
        type: "SAVE_SETTINGS",
        settings: this.settings,
      });
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  }

  private async addToWhitelist(pattern: string): Promise<void> {
    if (!this.settings) return;

    // Validate pattern
    if (!pattern || pattern.length < 2) {
      this.showError("Please enter a valid domain name");
      return;
    }

    // Clean up pattern
    let cleanPattern = pattern.toLowerCase();
    if (
      cleanPattern.startsWith("http://") ||
      cleanPattern.startsWith("https://")
    ) {
      cleanPattern = cleanPattern.replace(/^https?:\/\//, "");
    }
    if (cleanPattern.startsWith("www.")) {
      cleanPattern = cleanPattern.replace(/^www\./, "");
    }

    // Check if already exists
    if (this.settings.whitelist.includes(cleanPattern)) {
      this.showError("This website is already in the whitelist");
      return;
    }

    this.settings.whitelist.push(cleanPattern);
    await this.updateSetting("whitelist", this.settings.whitelist);
    this.updateWhitelistUI();
  }

  private async removeFromWhitelist(pattern: string): Promise<void> {
    if (!this.settings) return;

    this.settings.whitelist = this.settings.whitelist.filter(
      (p) => p !== pattern
    );
    await this.updateSetting("whitelist", this.settings.whitelist);
    this.updateWhitelistUI();
  }

  private updateWhitelistUI(): void {
    const whitelistContainer = document.getElementById("whitelistItems");
    if (!whitelistContainer || !this.settings) return;

    whitelistContainer.innerHTML = "";

    if (this.settings.whitelist.length === 0) {
      whitelistContainer.innerHTML =
        '<div style="color: #6c757d; font-style: italic; text-align: center; padding: 10px;">No websites whitelisted</div>';
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
      removeBtn?.addEventListener("click", () => {
        this.removeFromWhitelist(pattern);
      });

      whitelistContainer.appendChild(item);
    });
  }

  private async resetToDefaults(): Promise<void> {
    const defaultSettings: DarkModeSettings = {
      enabled: true,
      intensity: "dark",
      preserveImages: true,
      highContrast: false,
      fontSize: "normal",
      whitelist: [],
    };

    this.settings = defaultSettings;
    await this.updateSetting("enabled", true);
    await this.updateSetting("intensity", "dark");
    await this.updateSetting("preserveImages", true);
    await this.updateSetting("highContrast", false);
    await this.updateSetting("fontSize", "normal");
    await this.updateSetting("whitelist", []);

    this.updateUI();
    this.showSuccess("Settings reset to defaults");
  }

  private showError(message: string): void {
    // Simple error display - could be enhanced with a proper toast system
    console.error(message);
    // You could add a toast notification here
  }

  private showSuccess(message: string): void {
    // Simple success display - could be enhanced with a proper toast system
    console.log(message);
    // You could add a toast notification here
  }
}

// Initialize popup when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new PopupManager();
});
