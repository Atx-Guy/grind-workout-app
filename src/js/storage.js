import { STORAGE_KEYS } from '../config.js';

export function loadEquipment() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.EQUIPMENT);
        if (saved) return new Set(JSON.parse(saved));
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

export function saveUserData(data) {
    try {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
    } catch (e) {
        console.error('Error saving user data:', e);
    }
}

export function loadUserData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Error loading user data:', e);
    }
    return null;
}

export function clearUserData() {
    try {
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (e) {
        console.error('Error clearing user data:', e);
    }
}
