import { API_BASE } from '../config.js';

class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        const token = localStorage.getItem('grind_auth_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Request failed' }));
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error - please check your connection');
            }
            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

export const api = new ApiClient(API_BASE);

export async function fetchUser() {
    return api.get('/users/me');
}

export async function updateUserEquipment(equipment) {
    return api.put('/users/me/equipment', { equipment });
}

export async function saveWorkoutHistory(workoutId, duration, completedAt) {
    return api.post('/users/me/history', {
        workoutId,
        duration,
        completedAt: completedAt.toISOString(),
    });
}

export async function fetchWorkoutHistory() {
    return api.get('/users/me/history');
}

export async function login(email, password) {
    return api.post('/auth/login', { email, password });
}

export async function register(email, password) {
    return api.post('/auth/register', { email, password });
}
