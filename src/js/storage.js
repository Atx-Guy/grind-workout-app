const STORAGE_KEYS = {
    EQUIPMENT: 'grind_equipment',
    SETUP_DONE: 'grind_setup_done',
    WORKOUT_STATE: 'grind_workout_state',
    USER: 'grind_user',
    AUTH_TOKEN: 'grind_auth_token',
    SOUND_ENABLED: 'grind_sound_enabled',
};

export function loadEquipment() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.EQUIPMENT);
        if (saved) {
            return new Set(JSON.parse(saved));
        }
    } catch (e) {
        console.error('Error loading equipment:', e);
    }
    return null;
}

export function saveEquipment(equipment) {
    try {
        localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify([...equipment]));
    } catch (e) {
        console.error('Error saving equipment:', e);
    }
}

export function isSetupDone() {
    try {
        return localStorage.getItem(STORAGE_KEYS.SETUP_DONE) === '1';
    } catch (e) {
        return false;
    }
}

export function markSetupDone() {
    try {
        localStorage.setItem(STORAGE_KEYS.SETUP_DONE, '1');
    } catch (e) {
        console.error('Error marking setup done:', e);
    }
}

export function saveWorkoutState(state) {
    try {
        localStorage.setItem(STORAGE_KEYS.WORKOUT_STATE, JSON.stringify(state));
    } catch (e) {
        console.error('Error saving workout state:', e);
    }
}

export function loadWorkoutState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.WORKOUT_STATE);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Error loading workout state:', e);
    }
    return null;
}

export function clearWorkoutState() {
    try {
        localStorage.removeItem(STORAGE_KEYS.WORKOUT_STATE);
    } catch (e) {
        console.error('Error clearing workout state:', e);
    }
}

export function saveUser(user) {
    try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {
        console.error('Error saving user:', e);
    }
}

export function loadUser() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.USER);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Error loading user:', e);
    }
    return null;
}

export function clearUser() {
    try {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (e) {
        console.error('Error clearing user:', e);
    }
}

export function saveAuthToken(token) {
    try {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (e) {
        console.error('Error saving auth token:', e);
    }
}

export function loadAuthToken() {
    try {
        return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (e) {
        return null;
    }
}

export function isSoundEnabled() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
        return saved !== 'false';
    } catch (e) {
        return true;
    }
}

export function setSoundEnabled(enabled) {
    try {
        localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(enabled));
    } catch (e) {
        console.error('Error saving sound setting:', e);
    }
}
