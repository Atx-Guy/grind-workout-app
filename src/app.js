import { storage } from './storage.js';
import { createExerciseListItem, formatTime } from './ui.js';
import { WORKOUTS } from './workout.js';
import { WorkoutTimer } from './components/timer.js';
import { renderLoginScreen } from './components/login.js';
import { renderSetupScreen } from './components/setup.js';
import { renderBrowseScreen } from './components/browse.js';
import { renderHistoryScreen, saveWorkoutHistory } from './components/history.js';

class App {
  constructor() {
    this.currentScreen = null;
    this.user = null;
    this.timer = null;
    this.currentWorkout = null;
  }
  
  init() {
    this.user = storage.get('user', null);
    const setupComplete = storage.get('setup_complete', false);
    
    if (!this.user) {
      this.showLogin();
    } else if (!setupComplete) {
      this.showSetup();
    } else {
      this.showBrowse();
    }
    
    this.setupGlobalHandlers();
  }
  
  showLogin() {
    const appShell = document.querySelector('.app-shell');
    this.currentScreen = 'login';
    renderLoginScreen(appShell, () => {
      this.user = storage.get('user', null);
      this.showSetup();
    });
  }
  
  showSetup() {
    const appShell = document.querySelector('.app-shell');
    this.currentScreen = 'setup';
    renderSetupScreen(appShell, () => {
      this.showBrowse();
    });
  }
  
  showBrowse() {
    const appShell = document.querySelector('.app-shell');
    this.currentScreen = 'browse';
    this.showScreen('screenBrowse');
    
    appShell.innerHTML = `
      <div class="header">
        <div class="logo">GRIND<span>🔥</span></div>
        <div>
          <button class="history-btn" id="historyBtn">HISTORY</button>
          <div id="userProfile"></div>
        </div>
      </div>
    `;
    
    this.appendBrowseContent(appShell);
    
    document.getElementById('historyBtn')?.addEventListener('click', () => {
      this.showHistory();
    });
  }
  
  appendBrowseContent(container) {
    const browseDiv = document.createElement('div');
    renderBrowseScreen(browseDiv, 
      (workout) => this.showWorkoutDetail(workout),
      () => this.showGenerator(),
      () => this.showHistory()
    );
    container.appendChild(browseDiv);
  }
  
  showWorkoutDetail(workout) {
    this.currentWorkout = workout;
    this.showScreen('screenDetail');
    
    const detailTitle = document.getElementById('detailTitle');
    const detailMeta = document.getElementById('detailMeta');
    const exerciseList = document.getElementById('exerciseList');
    
    if (detailTitle) detailTitle.textContent = workout.title;
    if (detailMeta) {
      detailMeta.innerHTML = `
        <div class="detail-meta-item"><strong>${workout.duration}</strong> MIN</div>
        <div class="detail-meta-item"><strong>${workout.intensity}</strong> INTENSITY</div>
        <div class="detail-meta-item">${workout.equipment.join(', ')}</div>
      `;
    }
    if (exerciseList) {
      exerciseList.innerHTML = workout.steps.map((step, i) => createExerciseListItem(step, i)).join('');
    }
  }
  
  showTimer(workout) {
    this.showScreen('screenTimer');
    const container = document.querySelector('.app-shell');
    this.timer = new WorkoutTimer(workout, 
      (result) => this.showComplete(result),
      () => this.showBrowse()
    );
    this.timer.start(container);
  }
  
  showComplete(result) {
    this.showScreen('screenComplete');
    const stat = document.getElementById('completeStat');
    if (stat) {
      stat.innerHTML = `
        <div>${result.title}</div>
        <div><strong>${result.totalTime}</strong> minutes completed</div>
        <div><strong>${result.exercisesCompleted}</strong> exercises done</div>
      `;
    }
    
    const user = storage.get('user', {});
    saveWorkoutHistory(user.clerk_id || user.email, result);
  }
  
  showGenerator() {
    this.showScreen('screenGenerator');
  }
  
  showHistory() {
    const user = storage.get('user', {});
    const appShell = document.querySelector('.app-shell');
    renderHistoryScreen(appShell, user.clerk_id || user.email, () => {
      this.showBrowse();
    });
  }
  
  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add('active');
  }
  
  setupGlobalHandlers() {
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        const isOn = soundToggle.textContent === '🔊';
        soundToggle.textContent = isOn ? '🔇' : '🔊';
        storage.set('sound_enabled', !isOn);
      });
      const soundEnabled = storage.get('sound_enabled', true);
      soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
    }
  }
}

window.goHome = function() {
  const app = window.grindApp;
  if (app) {
    app.currentWorkout = null;
    app.showBrowse();
  }
};

window.startWorkout = function() {
  const app = window.grindApp;
  if (app && app.currentWorkout) {
    app.showTimer(app.currentWorkout);
  }
};

window.stopWorkout = function() {
  const app = window.grindApp;
  if (app) {
    app.showBrowse();
  }
};

window.togglePlay = function() {
  const app = window.grindApp;
  if (app?.timer) {
    const btn = document.getElementById('btnPlay');
    if (app.timer.isRunning) {
      app.timer.pause();
      btn.textContent = 'PLAY';
      btn.className = 'timer-btn btn-play';
    } else if (app.timer.isPaused) {
      app.timer.resume();
      btn.textContent = 'PAUSE';
      btn.className = 'timer-btn btn-pause';
    }
  }
};

window.skipExercise = function() {
  const app = window.grindApp;
  if (app?.timer) {
    app.timer.nextStep();
  }
};

window.toggleSound = function() {
  const soundToggle = document.getElementById('soundToggle');
  if (soundToggle) {
    soundToggle.click();
  }
};

window.openGenerator = function() {
  const app = window.grindApp;
  if (app) {
    app.showGenerator();
  }
};

export function initApp() {
  const app = new App();
  window.grindApp = app;
  app.init();
}
