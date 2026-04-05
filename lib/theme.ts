/** localStorage value: user explicitly chose light or dark. Absent = follow system. */
export const THEME_STORAGE_KEY = 'sf-theme'

/** Inline before paint to avoid flash; keep in sync with ThemeFab. */
export const THEME_INIT_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);var dark=false;if(t==='dark')dark=true;else if(t==='light')dark=false;else dark=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',dark);}catch(e){}})();`
