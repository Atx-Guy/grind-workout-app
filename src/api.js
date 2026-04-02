import { API_BASE } from './config.js';

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}

export const api = {
  users: {
    get: (userId) => request(`/users/${userId}`),
    getEquipment: (userId) => request(`/users/${userId}/equipment`),
    updateEquipment: (userId, equipment) => 
      request(`/users/${userId}/equipment`, {
        method: 'PUT',
        body: JSON.stringify({ equipment })
      })
  },
  workouts: {
    getHistory: (userId) => request(`/workouts/${userId}`),
    save: (userId, workout) => request(`/workouts/${userId}`, {
      method: 'POST',
      body: JSON.stringify(workout)
    })
  },
  gateways: {
    list: (userId) => request(`/gateways/${userId}`),
    pair: (userId, gatewayId, gatewayName) => request(`/gateways/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ gatewayId, gatewayName })
    }),
    unpair: (userId, gatewayId) => request(`/gateways/${userId}/${gatewayId}`, {
      method: 'DELETE'
    })
  },
  health: () => request('/health')
};
