export type Theme = 'light' | 'dark'

const KEY = 'kanban-theme'

/** Saved preference, else the system setting. */
export function getTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // fall through to the system setting
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Apply a theme (shadcn's dark mode is the `.dark` class on <html>) and remember it. */
export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // not persisted; still applied for this visit
  }
}
