export interface DarkModeSettings {
  enabled: boolean;
  intensity: 'light' | 'medium' | 'dark' | 'very-dark';
  preserveImages: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  whitelist: string[];
}

export interface ThemeColors {
  background: string;
  text: string;
  link: string;
  border: string;
  shadow: string;
  highlight: string;
}

export interface WebsiteOverride {
  url: string;
  customColors?: Partial<ThemeColors>;
  disabled?: boolean;
}

export type IntensityLevel = 'light' | 'medium' | 'dark' | 'very-dark';
export type FontSize = 'normal' | 'large' | 'extra-large'; 