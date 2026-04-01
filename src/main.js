import * as app from './js/app.js';
import * as ui from './js/ui.js';
import * as storage from './js/storage.js';

export function init() {
    app.initializeApp();
    ui.updateSoundToggle();

    ui.showScreen('screenLogin');

    const savedState = app.skipLogin();
    if (savedState.restored) {
        ui.renderDetail();
        ui.showScreen('screenTimer');
        ui.updateTimerDisplay();
        return;
    }

    switch (savedState.screen) {
        case 'setup':
            ui.renderSetup();
            ui.showScreen('screenSetup');
            break;
        case 'browse':
            ui.renderEquipBar();
            ui.renderFilters();
            ui.renderWorkoutGrid();
            ui.showScreen('screenBrowse');
            break;
        default:
            ui.renderSetup();
            ui.showScreen('screenSetup');
    }

    ui.renderUserProfile();
    setupEventListeners();
}

function setupEventListeners() {
    document.getElementById('backBtn')?.addEventListener('click', () => {
        if (app.AppState.isRunning) {
            app.stopWorkout();
        }
        ui.renderEquipBar();
        ui.renderFilters();
        ui.renderWorkoutGrid();
        ui.showScreen('screenBrowse');
    });

    document.getElementById('soundToggle')?.addEventListener('click', () => {
        app.toggleSound();
        ui.updateSoundToggle();
    });

    document.getElementById('setupGoBtn')?.addEventListener('click', () => {
        app.finishSetup();
        ui.renderEquipBar();
        ui.renderFilters();
        ui.renderWorkoutGrid();
        ui.showScreen('screenBrowse');
    });

    document.querySelector('.setup-skip')?.addEventListener('click', () => {
        app.skipSetup();
        ui.renderEquipBar();
        ui.renderFilters();
        ui.renderWorkoutGrid();
        ui.showScreen('screenBrowse');
    });

    document.querySelector('.btn-start-workout')?.addEventListener('click', () => {
        app.startWorkout();
        ui.showScreen('screenTimer');
        ui.updateTimerDisplay();
        app.togglePlay();
    });

    document.getElementById('btnPlay')?.addEventListener('click', () => {
        app.togglePlay();
        ui.updateTimerDisplay();
    });

    document.querySelector('.btn-stop')?.addEventListener('click', () => {
        app.stopWorkout();
        ui.renderEquipBar();
        ui.renderFilters();
        ui.renderWorkoutGrid();
        ui.showScreen('screenBrowse');
    });

    document.querySelector('.btn-skip')?.addEventListener('click', () => {
        app.skipExercise();
        ui.updateTimerDisplay();
    });

    document.getElementById('genInput')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleGenerateWorkout();
        }
    });

    document.querySelector('.ai-generate-btn')?.addEventListener('click', () => {
        ui.showScreen('screenGenerator');
        ui.renderGenChips();
        const genInput = document.getElementById('genInput');
        const genOutput = document.getElementById('genOutput');
        if (genInput) genInput.value = '';
        if (genOutput) genOutput.innerHTML = '';
    });

    const completeBtn = document.querySelector('#screenComplete .btn-start-workout');
    if (completeBtn) {
        completeBtn.addEventListener('click', () => {
            ui.renderEquipBar();
            ui.renderFilters();
            ui.renderWorkoutGrid();
            ui.showScreen('screenBrowse');
        });
    }

    document.getElementById('loginPassword')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleLogin();
        }
    });

    document.getElementById('loginBtn')?.addEventListener('click', handleLogin);
    document.getElementById('signupBtn')?.addEventListener('click', handleSignup);

    document.querySelector('.login-toggle a')?.addEventListener('click', () => {
        const savedState = app.skipLogin();
        if (savedState.restored) {
            ui.renderDetail();
            ui.showScreen('screenTimer');
            ui.updateTimerDisplay();
            return;
        }
        if (savedState.screen === 'browse') {
            ui.renderEquipBar();
            ui.renderFilters();
            ui.renderWorkoutGrid();
            ui.showScreen('screenBrowse');
        } else {
            ui.renderSetup();
            ui.showScreen('screenSetup');
        }
    });
}

async function handleLogin() {
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    const errorDiv = document.getElementById('loginError');
    const loginBtn = document.getElementById('loginBtn');

    if (!email || !password) {
        showLoginError('Please enter email and password');
        return;
    }

    loginBtn.disabled = true;
    if (errorDiv) errorDiv.style.display = 'none';

    const result = await app.handleLogin(email, password);

    if (result.success) {
        ui.renderUserProfile();
        const savedState = app.skipLogin();
        if (savedState.screen === 'browse') {
            ui.renderEquipBar();
            ui.renderFilters();
            ui.renderWorkoutGrid();
            ui.showScreen('screenBrowse');
        } else {
            ui.renderSetup();
            ui.showScreen('screenSetup');
        }
    } else {
        showLoginError(result.error || 'Login failed');
        loginBtn.disabled = false;
    }
}

async function handleSignup() {
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    const errorDiv = document.getElementById('loginError');
    const signupBtn = document.getElementById('signupBtn');

    if (!email || !password) {
        showLoginError('Please enter email and password');
        return;
    }

    if (password.length < 6) {
        showLoginError('Password must be at least 6 characters');
        return;
    }

    signupBtn.disabled = true;
    if (errorDiv) errorDiv.style.display = 'none';

    const result = await app.handleSignup(email, password);

    if (result.success) {
        ui.renderUserProfile();
        ui.renderSetup();
        ui.showScreen('screenSetup');
    } else {
        showLoginError(result.error || 'Signup failed');
        signupBtn.disabled = false;
    }
}

function showLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

async function handleGenerateWorkout() {
    const input = document.getElementById('genInput')?.value.trim();
    if (!input) return;

    const result = await app.generateWorkout(input);

    if (result.success) {
        ui.renderDetail();
        ui.showScreen('screenDetail');
    } else {
        const output = document.getElementById('genOutput');
        if (output) {
            output.innerHTML = `<div class="gen-error">
                <strong>Couldn't generate workout</strong><br>
                ${result.error}<br>
                <button class="gen-retry-btn">Try Again</button>
            </div>`;
            output.querySelector('.gen-retry-btn')?.addEventListener('click', handleGenerateWorkout);
        }
    }
}

document.addEventListener('DOMContentLoaded', init);
