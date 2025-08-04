import { ThemeColors, IntensityLevel } from '../types';

export class ThemeGenerator {
  private static readonly THEME_COLORS: Record<IntensityLevel, ThemeColors> = {
    'light': {
      background: '#f8f9fa',
      text: '#212529',
      link: '#007bff',
      border: '#dee2e6',
      shadow: 'rgba(0, 0, 0, 0.1)',
      highlight: '#e3f2fd'
    },
    'medium': {
      background: '#343a40',
      text: '#f8f9fa',
      link: '#6ea8fe',
      border: '#495057',
      shadow: 'rgba(0, 0, 0, 0.3)',
      highlight: '#495057'
    },
    'dark': {
      background: '#212529',
      text: '#f8f9fa',
      link: '#4dabf7',
      border: '#343a40',
      shadow: 'rgba(0, 0, 0, 0.5)',
      highlight: '#343a40'
    },
    'very-dark': {
      background: '#000000',
      text: '#ffffff',
      link: '#339af0',
      border: '#1a1a1a',
      shadow: 'rgba(0, 0, 0, 0.7)',
      highlight: '#1a1a1a'
    }
  };

  static generateCSS(intensity: IntensityLevel, highContrast: boolean = false): string {
    const colors = this.THEME_COLORS[intensity];
    
    if (highContrast) {
      colors.background = '#000000';
      colors.text = '#ffffff';
      colors.border = '#ffffff';
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
        filter: ${intensity === 'very-dark' ? 'brightness(0.8) contrast(1.2)' : 'none'} !important;
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
    // Simple brightness adjustment for hover states
    if (color.startsWith('#')) {
      const num = parseInt(color.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) + amt;
      const G = (num >> 8 & 0x00FF) + amt;
      const B = (num & 0x0000FF) + amt;
      return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    return color;
  }

  static generateFontSizeCSS(fontSize: string): string {
    const sizes = {
      'normal': '1rem',
      'large': '1.2rem',
      'extra-large': '1.5rem'
    };

    return `
      body, html {
        font-size: ${sizes[fontSize as keyof typeof sizes] || '1rem'} !important;
      }
    `;
  }
} 