import { EQUIPMENT } from './config.js';
import { 
    initApp, 
    showScreen, 
    goHome, 
    toggleSound, 
    restoreWorkoutState,
    startWorkout,
    togglePlay,
    skipExercise,
    stopWorkout
} from './js/app.js';
import { renderEquipBar, renderFilters, renderWorkoutGrid, showDetail } from './js/ui.js';
import { openGenerator, generateWorkout, renderGenChips } from './js/workout.js';
import { renderLoginScreenHTML, renderLoginError, updateUserProfile, hideUserProfile } from './components/LoginScreen.js';
import { renderSetupScreenHTML, renderSetupScreen, setupSetupEventListeners } from './components/SetupScreen.js';
import { renderBrowseScreenHTML } from './components/BrowseScreen.js';
import { renderGeneratorScreenHTML } from './components/GeneratorScreen.js';
import { renderDetailScreenHTML } from './components/DetailScreen.js';
import { renderTimerScreenHTML, setupTimerEventListeners } from './components/TimerScreen.js';
import { renderCompleteScreenHTML } from './components/CompleteScreen.js';
import { renderHistoryScreenHTML, renderHistoryScreen } from './components/HistoryScreen.js';
import { initGeneratorScreen } from './components/GeneratorScreen.js';
import { renderBrowseContent } from './components/BrowseScreen.js';
import { isSetupDone, markSetupDone, saveEquipment } from './js/storage.js';
import { login, logout } from './js/api.js';

export let app = null;

function renderAppShell() {
    const appContainer = document.getElementById('app');
    if (!appContainer) return;

    appContainer.innerHTML = `
        <div class="app-shell">
            <div class="header">
                <div class="logo">GRIND<span>🔥</span></div>
                <div id="userProfile" style="display: none;"></div>
                <button class="header-back" id="backBtn">← Back</button>
            </div>

            <div class="screen" id="screenLogin"></div>
            <div class="screen" id="screenSetup"></div>
            <div class="screen" id="screenBrowse"></div>
            <div class="screen" id="screenGenerator"></div>
            <div class="screen" id="screenDetail"></div>
            <div class="screen" id="screenTimer"></div>
            <div class="screen" id="screenComplete"></div>
            <div class="screen" id="screenHistory"></div>
        </div>
    `;

    document.getElementById('screenLogin').innerHTML = renderLoginScreenHTML();
    document.getElementById('screenSetup').innerHTML = renderSetupScreenHTML();
    document.getElementById('screenBrowse').innerHTML = renderBrowseScreenHTML();
    document.getElementById('screenGenerator').innerHTML = renderGeneratorScreenHTML();
    document.getElementById('screenDetail').innerHTML = renderDetailScreenHTML();
    document.getElementById('screenTimer').innerHTML = renderTimerScreenHTML();
    document.getElementById('screenComplete').innerHTML = renderCompleteScreenHTML();
    document.getElementById('screenHistory').innerHTML = renderHistoryScreenHTML();
}

function setupEventListeners() {
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.addEventListener('click', () => toggleSound(app));
    }

    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => goHome(app));
    }

    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }

    const signupBtn = document.getElementById('signupBtn');
    if (signupBtn) {
        signupBtn.addEventListener('click', handleSignup);
    }

    const skipLoginLink = document.getElementById('skipLoginLink');
    if (skipLoginLink) {
        skipLoginLink.addEventListener('click', skipLogin);
    }

    const loginPassword = document.getElementById('loginPassword');
    if (loginPassword) {
        loginPassword.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleLogin();
            }
        });
    }

    setupSetupEventListeners(app);
    setupTimerEventListeners(app);

    const startWorkoutBtn = document.getElementById('startWorkoutBtn');
    if (startWorkoutBtn) {
        startWorkoutBtn.addEventListener('click', () => startWorkout(app));
    }

    const aiGenerateBtn = document.getElementById('aiGenerateBtn');
    if (aiGenerateBtn) {
        aiGenerateBtn.addEventListener('click', () => {
            openGenerator(app);
            initGeneratorScreen(app);
        });
    }

    const completeBackBtn = document.getElementById('completeBackBtn');
    if (completeBackBtn) {
        completeBackBtn.addEventListener('click', () => goHome(app));
    }

    document.addEventListener('click', (e) => {
        if (e.target.id === 'openHistoryBtn') {
            renderHistoryScreen(app);
            showScreen('screenHistory', app);
        }
        if (e.target.id === 'logoutBtn') {
            handleLogout();
        }
    });
}

async function handleLogin() {
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email || !password) {
        renderLoginError('Please enter email and password');
        return;
    }
    
    try {
        await login(email, password);
        app.state.currentUser = { email };
        updateUserProfile(app.state.currentUser);
        continueAfterAuth();
    } catch (err) {
        renderLoginError(err.message || 'Login failed. Try offline mode.');
    }
}

async function handleSignup() {
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email || !password) {
        renderLoginError('Please enter email and password');
        return;
    }
    
    if (password.length < 6) {
        renderLoginError('Password must be at least 6 characters');
        return;
    }
    
    renderLoginError('Signup requires backend setup. Use offline mode for now.');
}

async function handleLogout() {
    await logout();
    app.state.currentUser = null;
    hideUserProfile();
    showScreen('screenLogin', app);
}

function continueAfterAuth() {
    if (restoreWorkoutState(app)) {
        return;
    }

    if (isSetupDone()) {
        renderBrowseContent(app);
        showScreen('screenBrowse', app);
    } else {
        renderSetupScreen(app);
        showScreen('screenSetup', app);
    }
}

function skipLogin() {
    if (restoreWorkoutState(app)) {
        return;
    }

    if (isSetupDone()) {
        renderBrowseContent(app);
        showScreen('screenBrowse', app);
    } else {
        renderSetupScreen(app);
        showScreen('screenSetup', app);
    }
}

function bootstrap() {
    app = initApp();
    renderAppShell();
    setupEventListeners();

    if (restoreWorkoutState(app)) {
        return;
    }

    if (isSetupDone()) {
        renderBrowseContent(app);
        showScreen('screenBrowse', app);
    } else {
        renderSetupScreen(app);
        showScreen('screenSetup', app);
    }
}

document.addEventListener('DOMContentLoaded', bootstrap);

window.app = app;
window.showScreen = (screenId) => showScreen(screenId, app);
window.goHome = () => goHome(app);
window.toggleSound = () => toggleSound(app);
window.startWorkout = () => startWorkout(app);
window.togglePlay = () => togglePlay(app);
window.skipExercise = () => skipExercise(app);
window.stopWorkout = () => stopWorkout(app);
window.openGenerator = () => openGenerator(app);
window.generateWorkout = () => generateWorkout(app);
window.openHistory = () => {
    renderHistoryScreen(app);
    showScreen('screenHistory', app);
};
window.handleLogout = () => handleLogout();
