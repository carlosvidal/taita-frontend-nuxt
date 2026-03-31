/**
 * Composable to manage blog theme.
 * Reads the theme from blog settings and applies it as a data attribute on <html>.
 * Themes are defined in assets/css/themes.css.
 */

const VALID_THEMES = [
  'editorial', // default — NYT/New Yorker/Write
  'clean',     // Medium
  'notion',    // Notion
  'starter',   // minimalio/Go WP
  'dawn',      // Ghost Dawn
  'edge',      // Ghost Edge
  'headline',  // Ghost Headline
  'magazine',  // Gillion/Bridge WP
] as const;

export type ThemeName = typeof VALID_THEMES[number];

// Map legacy template field values to new theme names
const LEGACY_MAP: Record<string, ThemeName> = {
  'default': 'editorial',
  'minimal': 'starter',
  'professional': 'headline',
};

export function useTheme() {
  const currentTheme = useState<ThemeName>('blog-theme', () => 'editorial');

  /**
   * Apply theme to the <html> element.
   * Called on both server and client.
   */
  const applyTheme = (theme: string) => {
    // Resolve legacy names first
    const resolved = LEGACY_MAP[theme] || theme;
    const validTheme = VALID_THEMES.includes(resolved as ThemeName)
      ? (resolved as ThemeName)
      : 'editorial';

    currentTheme.value = validTheme;

    // editorial is the default (no data-theme attribute needed)
    if (import.meta.client) {
      const html = document.documentElement;
      if (validTheme === 'editorial') {
        html.removeAttribute('data-theme');
      } else {
        html.setAttribute('data-theme', validTheme);
      }
    }
  };

  /**
   * Set theme from blog settings (called after fetchSettings).
   * The backend stores the theme in the `template` field.
   */
  const setThemeFromSettings = (settings: Record<string, any> | null) => {
    const theme = settings?.template || 'editorial';
    applyTheme(theme);
  };

  /**
   * SSR head integration — sets the data-theme attribute on <html> during SSR.
   */
  useHead({
    htmlAttrs: computed(() => {
      if (currentTheme.value === 'editorial') return {};
      return { 'data-theme': currentTheme.value };
    }),
  });

  return {
    currentTheme: readonly(currentTheme),
    applyTheme,
    setThemeFromSettings,
    VALID_THEMES,
  };
}
