import { API_BASE } from '../config.js';

export async function fetchUser(userId) {
    try {
        const response = await fetch(`${API_BASE}/users/${userId}`, {
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

export async function updateUserEquipment(userId, equipment) {
    try {
        const response = await fetch(`${API_BASE}/users/${userId}/equipment`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ equipment })
        });
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating equipment:', error);
        return null;
    }
}

export async function saveWorkoutHistory(userId, workoutId, duration, completedAt) {
    try {
        const response = await fetch(`${API_BASE}/users/${userId}/history`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                workoutId,
                duration,
                completedAt: completedAt ? completedAt.toISOString() : new Date().toISOString()
            })
        });
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error saving workout history:', error);
        return null;
    }
}

export async function getWorkoutHistory(userId) {
    try {
        const response = await fetch(`${API_BASE}/users/${userId}/history`, {
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching workout history:', error);
        return [];
    }
}

export async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }
        return await response.json();
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

export async function signup(email, password) {
    try {
        const response = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Signup failed');
        }
        return await response.json();
    } catch (error) {
        console.error('Signup error:', error);
        throw error;
    }
}

export async function logout() {
    try {
        const response = await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        return response.ok;
    } catch (error) {
        console.error('Logout error:', error);
        return false;
    }
}

export async function getCurrentUser() {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            credentials: 'include'
        });
        if (!response.ok) {
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}
