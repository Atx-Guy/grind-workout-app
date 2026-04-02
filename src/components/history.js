import { createHistoryItem } from '../ui.js';
import { api } from '../api.js';
import { storage } from '../storage.js';
import { WORKOUTS } from '../workout.js';

export async function renderHistoryScreen(container, userId, onBack) {
  container.innerHTML = `
    <div class="screen" id="screenHistory">
      <div class="history-header">
        <div class="history-title">WORKOUT HISTORY</div>
        <div class="history-subtitle">Your completed workouts</div>
      </div>
      <div class="history-list" id="historyList">
        <div class="history-loading">Loading history...</div>
      </div>
      <button class="btn-start-workout" id="historyBackBtn" style="margin-top:20px;max-width:300px">BACK</button>
    </div>
  `;
  
  document.getElementById('historyBackBtn')?.addEventListener('click', onBack);
  
  const historyList = document.getElementById('historyList');
  
  try {
    if (userId && !storage.get('user', {}).demo) {
      const history = await api.workouts.getHistory(userId);
      if (history.length === 0) {
        historyList.innerHTML = `
          <div class="history-empty">
            <p>No workouts completed yet. Start grinding!</p>
          </div>
        `;
      } else {
        historyList.innerHTML = history.map(item => createHistoryItem(item)).join('');
      }
    } else {
      const localHistory = storage.get('history', []);
      if (localHistory.length === 0) {
        historyList.innerHTML = `
          <div class="history-empty">
            <p>No workouts completed yet. Start grinding!</p>
          </div>
        `;
      } else {
        historyList.innerHTML = localHistory.map(item => createHistoryItem(item)).join('');
      }
    }
  } catch (error) {
    console.error('Failed to load history:', error);
    const localHistory = storage.get('history', []);
    if (localHistory.length === 0) {
      historyList.innerHTML = `
        <div class="history-empty">
          <p>No workouts completed yet. Start grinding!</p>
        </div>
      `;
    } else {
      historyList.innerHTML = localHistory.map(item => createHistoryItem(item)).join('');
    }
  }
}

export async function saveWorkoutHistory(userId, workout) {
  const historyItem = {
    workout_id: workout.id,
    title: workout.title,
    category: workout.category,
    duration: workout.duration,
    total_time: workout.totalTime,
    exercises_completed: workout.exercisesCompleted,
    completed_at: new Date().toISOString()
  };
  
  const localHistory = storage.get('history', []);
  localHistory.unshift(historyItem);
  storage.set('history', localHistory.slice(0, 50));
  
  if (userId && !storage.get('user', {}).demo) {
    try {
      await api.workouts.save(userId, {
        workoutId: workout.id,
        title: workout.title,
        category: workout.category,
        duration: workout.duration,
        totalTime: workout.totalTime,
        exercisesCompleted: workout.exercisesCompleted
      });
    } catch (error) {
      console.error('Failed to sync history:', error);
    }
  }
}
