import { getHistory, syncHistory } from '../api.js';
import { getCurrentUser } from './login.js';
import { showScreen } from '../main.js';

export function renderHistoryScreen(container) {
    const user = getCurrentUser();
    if (!user) {
        container.innerHTML = `
            <div class="history-empty">
                <p>Please sign in to view your workout history.</p>
            </div>
        `;
        return;
    }
    loadHistory(user.id, container);
}

async function loadHistory(userId, container) {
    container.innerHTML = '<div class="history-loading">Loading history...</div>';
    
    try {
        const data = await getHistory(userId);
        renderHistoryList(data.history || [], container);
        await syncToBackend(userId, data.history || []);
    } catch (error) {
        console.error('Error loading history:', error);
        container.innerHTML = `
            <div class="history-empty">
                <p>Error loading history.</p>
                <p style="font-size: 12px; margin-top: 8px;">
                    ${error.message ? `Error: ${error.message}. ` : ''}Please try again.
                </p>
            </div>
        `;
    }
}

function renderHistoryList(history, container) {
    if (!history || history.length === 0) {
        container.innerHTML = `
            <div class="history-empty">
                <p>No workouts completed yet.</p>
                <p style="font-size: 12px; margin-top: 8px;">
                    Complete a workout to see it here.
                </p>
            </div>
        `;
        return;
    }

    const html = history.map(item => {
        const date = new Date(item.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        const duration = item.duration ? `${item.duration} min` : '';
        const exercises = item.exercises?.length || 0;
        
        return `
            <div class="history-item" onclick="window.showHistoryDetail('${item.id}')">
                <div class="history-date">${date}</div>
                <div class="history-title">${item.title || 'Workout'}</div>
                <div class="history-meta">${exercises} exercises${duration ? ` · ${duration}` : ''}</div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

async function syncToBackend(userId, history) {
    try {
        await syncHistory(userId, history);
    } catch (error) {
        console.error('History sync failed:', error);
    }
}

window.showHistoryDetail = function(workoutId) {
    showScreen('screenDetail');
};
