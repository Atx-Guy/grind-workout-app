const API_BASE = '/api';
let authToken = null;

export function setAuthToken(token) {
    authToken = token;
}

export function getAuthToken() {
    return authToken;
}

function getHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
}

async function handleResponse(response) {
    if (response.status === 401) {
        authToken = null;
        throw new Error('unauthenticated');
    }
    if (response.status === 403) {
        throw new Error('access_denied');
    }
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || 'Request failed');
    }
    return response.json();
}

export async function apiGet(endpoint) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'GET',
        headers: getHeaders()
    });
    return handleResponse(response);
}

export async function apiPost(endpoint, data) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
}

export async function apiPut(endpoint, data) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
}

export async function apiDelete(endpoint) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    return handleResponse(response);
}

export async function getWorkouts(userId) {
    return apiGet(`/users/${userId}/workouts`);
}

export async function saveWorkout(userId, workout) {
    return apiPost(`/users/${userId}/workouts`, workout);
}

export async function getHistory(userId) {
    return apiGet(`/users/${userId}/history`);
}

export async function syncHistory(userId, history) {
    return apiPost(`/users/${userId}/history/sync`, { history });
}

export async function getUser(userId) {
    return apiGet(`/users/${userId}`);
}

export async function createOrUpdateUser(userId, data) {
    return apiPut(`/users/${userId}`, data);
}

export async function getGateways(userId) {
    return apiGet(`/users/${userId}/gateways`);
}

export async function pairGateway(userId, gatewayCode) {
    return apiPost(`/users/${userId}/gateways`, { code: gatewayCode });
}

export async function unpairGateway(userId, gatewayId) {
    return apiDelete(`/users/${userId}/gateways/${gatewayId}`);
}
