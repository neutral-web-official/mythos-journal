// localStorage helper functions
export const STORAGE_KEYS = {
  // Journal
  entries: "mythos-entries-v1",
  goal: "mythos-goal-v1",
  // Note
  categories: "mythos-note-categories-v1",
  pages: "mythos-note-pages-v1",
  images: "mythos-note-images-v1",
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

// Image storage with short IDs
function generateShortId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function saveImage(base64Data) {
  const images = load(STORAGE_KEYS.images, {});
  const id = generateShortId();
  images[id] = base64Data;
  save(STORAGE_KEYS.images, images);
  return id;
}

export function getImage(id) {
  const images = load(STORAGE_KEYS.images, {});
  return images[id] || null;
}

export function getAllImages() {
  return load(STORAGE_KEYS.images, {});
}
