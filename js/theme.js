/* ============================================
   PESTLEADS — THEME.JS
   Dark / light mode toggle
   ============================================ */

const root = document.documentElement;
const STORAGE_KEY = 'pestleads-theme';

/* ─── Get saved preference or system default ─── */
function getPreferredTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
}

/* ─── Apply theme to root element ─── */
function applyTheme(theme) {
  if (theme === 'light') {
    root.setAttribute('data-theme', 'light');
  } else {
    root.removeAttribute('data-theme');
  }
  localStorage.setItem(STORAGE_KEY, theme);
  updateToggleIcon(theme);
}

/* ─── Update moon / sun icon ─── */
function updateToggleIcon(theme) {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  toggle.setAttribute('aria-label',
    theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
  );
  toggle.dataset.theme = theme;
}

/* ─── Toggle between modes ─── */
function toggleTheme() {
  const current = localStorage.getItem(STORAGE_KEY) || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

/* ─── Init on page load ─── */
applyTheme(getPreferredTheme());

/* ─── Expose toggle for the button in HTML ─── */
window.toggleTheme = toggleTheme;