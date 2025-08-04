import { DarkModeSettings, WebsiteOverride } from '../types';

export class StorageManager {
  private static readonly DEFAULT_SETTINGS: DarkModeSettings = {
    enabled: true,
    intensity: 'dark',
    preserveImages: true,
    highContrast: false,
    fontSize: 'normal',
    whitelist: []
  };

  static async getSettings(): Promise<DarkModeSettings> {
    try {
      const result = await chrome.storage.sync.get('darkModeSettings');
      return { ...this.DEFAULT_SETTINGS, ...result.darkModeSettings };
    } catch (error) {
      console.error('Error getting settings:', error);
      return this.DEFAULT_SETTINGS;
    }
  }

  static async saveSettings(settings: Partial<DarkModeSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      await chrome.storage.sync.set({ darkModeSettings: newSettings });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  static async getWebsiteOverrides(): Promise<WebsiteOverride[]> {
    try {
      const result = await chrome.storage.sync.get('websiteOverrides');
      return result.websiteOverrides || [];
    } catch (error) {
      console.error('Error getting website overrides:', error);
      return [];
    }
  }

  static async saveWebsiteOverride(override: WebsiteOverride): Promise<void> {
    try {
      const overrides = await this.getWebsiteOverrides();
      const existingIndex = overrides.findIndex(o => o.url === override.url);
      
      if (existingIndex >= 0) {
        overrides[existingIndex] = override;
      } else {
        overrides.push(override);
      }
      
      await chrome.storage.sync.set({ websiteOverrides: overrides });
    } catch (error) {
      console.error('Error saving website override:', error);
    }
  }

  static async removeWebsiteOverride(url: string): Promise<void> {
    try {
      const overrides = await this.getWebsiteOverrides();
      const filteredOverrides = overrides.filter(o => o.url !== url);
      await chrome.storage.sync.set({ websiteOverrides: filteredOverrides });
    } catch (error) {
      console.error('Error removing website override:', error);
    }
  }

  static async isWhitelisted(url: string): Promise<boolean> {
    try {
      const settings = await this.getSettings();
      return settings.whitelist.some(pattern => {
        if (pattern.startsWith('*.')) {
          const domain = pattern.slice(2);
          return url.includes(domain);
        }
        return url.includes(pattern);
      });
    } catch (error) {
      console.error('Error checking whitelist:', error);
      return false;
    }
  }

  static async addToWhitelist(pattern: string): Promise<void> {
    try {
      const settings = await this.getSettings();
      if (!settings.whitelist.includes(pattern)) {
        settings.whitelist.push(pattern);
        await this.saveSettings(settings);
      }
    } catch (error) {
      console.error('Error adding to whitelist:', error);
    }
  }

  static async removeFromWhitelist(pattern: string): Promise<void> {
    try {
      const settings = await this.getSettings();
      settings.whitelist = settings.whitelist.filter(p => p !== pattern);
      await this.saveSettings(settings);
    } catch (error) {
      console.error('Error removing from whitelist:', error);
    }
  }
} 