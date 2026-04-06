// api.js
import { showToast } from './utils.js';

const API_BASE = '/api';

async function request(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, options);
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || `HTTP Error ${res.status}`);
        }
        return await res.json();
    } catch (e) {
        console.error("API Error:", e);
        showToast(e.message, 'error');
        throw e;
    }
}

export const API = {
    // Stats
    getStats: () => request('/stats'),

    // Students
    getStudents: () => request('/students'),
    addStudent: (data) => request('/students', 'POST', data),
    updateStudent: (id, data) => request(`/students/${id}`, 'PUT', data),
    deleteStudent: (id) => request(`/students/${id}`, 'DELETE'),

    // Fees
    getFees: () => request('/fees'),
    sendReminder: (data) => request('/fees/remind', 'POST', data)
};
