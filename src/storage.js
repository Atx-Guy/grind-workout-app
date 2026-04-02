const STORAGE_PREFIX = 'grind_';

export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    localStorage.removeItem(STORAGE_PREFIX + key);
  },
  getString(key, defaultValue = '') {
    try {
      return localStorage.getItem(STORAGE_PREFIX + key) || defaultValue;
    } catch {
      return defaultValue;
    }
  },
  setString(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, value);
      return true;
    } catch {
      return false;
    }
  }
};
