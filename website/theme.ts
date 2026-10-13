// Theme controller & switcher for the website.
// Provides two content themes: Typora (default) and GitHub.
// Persists selection in localStorage and dynamically applies theme stylesheet.

import typoraCss from "../src/styles/theme-typora.css?raw";
import githubCss from "../src/styles/theme-github.css?raw";

export type Theme = "typora" | "github";

const STORAGE_KEY = "typora-web:theme";
const STYLE_ID = "typora-web-theme-style";

const THEME_CSS: Record<Theme, string> = {
  typora: typoraCss,
  github: githubCss,
};

let currentTheme: Theme = "typora";
try {
  const saved = localStorage.getItem(STORAGE_KEY) as Theme;
  if (saved === "typora" || saved === "github") {
    currentTheme = saved;
  }
} catch {}

let styleEl: HTMLStyleElement | null = null;

function ensureStyleElement(): HTMLStyleElement {
  if (!styleEl) {
    styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = STYLE_ID;
      document.head.appendChild(styleEl);
    }
  }
  return styleEl;
}

export function getTheme(): Theme {
  return currentTheme;
}

export function setTheme(theme: Theme): void {
  currentTheme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {}

  const el = ensureStyleElement();
  el.textContent = THEME_CSS[theme];

  window.dispatchEvent(
    new CustomEvent("typora-theme-change", { detail: { theme } }),
  );
}

export function initTheme(): void {
  setTheme(currentTheme);
}

// Typora-style minimalist segmented toggle button in the upper-right corner.
export function createThemeSwitch(): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "theme-switch";
  wrap.setAttribute("role", "radiogroup");
  wrap.setAttribute("aria-label", "主题切换");

  wrap.innerHTML = `
    <button type="button" class="theme-btn${currentTheme === "typora" ? " active" : ""}" data-theme="typora" title="Typora 极简主题">Typora</button>
    <button type="button" class="theme-btn${currentTheme === "github" ? " active" : ""}" data-theme="github" title="GitHub 经典主题">GitHub</button>
  `;

  wrap.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("button[data-theme]");
    if (!btn) return;
    const theme = btn.dataset.theme as Theme;
    if (theme && theme !== currentTheme) {
      setTheme(theme);
    }
  });

  const onThemeChange = (e: Event) => {
    const active = (e as CustomEvent<{ theme: Theme }>).detail.theme;
    for (const b of wrap.querySelectorAll<HTMLButtonElement>(".theme-btn")) {
      b.classList.toggle("active", b.dataset.theme === active);
    }
  };

  window.addEventListener("typora-theme-change", onThemeChange);

  return wrap;
}
