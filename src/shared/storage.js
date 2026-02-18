// localStorage helper functions
export const STORAGE_KEYS = {
  // Journal
  entries: "mythos-entries-v1",
  goal: "mythos-goal-v1",
  // Note
  categories: "mythos-note-categories-v1",
  pages: "mythos-note-pages-v1",
};

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("localStorage save error:", e);
  }
}

export function getNoteContentKey(pageId, panelId) {
  return `mythos-note-content-${pageId}-${panelId}`;
}
