import { initClerk, openSignIn, openSignUp, signOut, isAuthenticated, getCurrentUser, onClerkReady } from './components/login.js';
import { renderHistoryScreen } from './components/history.js';
import { renderGatewayPairingScreen } from './components/gatewayPairing.js';
import { setAuthToken, createOrUpdateUser } from './api.js';

let currentScreen = 'screenLogin';
let userProfile = null;

export function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));
    
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');
        currentScreen = screenId;
        
        if (screenId === 'screenHistory') {
            const historyList = document.getElementById('historyList');
            if (historyList) {
                renderHistoryScreen(historyList);
            }
        }
        
        if (screenId === 'screenGateway') {
            const gatewayContainer = document.getElementById('gatewayContainer');
            if (gatewayContainer) {
                renderGatewayPairingScreen(gatewayContainer);
            }
        }
        
        updateHeaderBackButton(screenId);
    }
}

function updateHeaderBackButton(screenId) {
    const backBtn = document.querySelector('.header-back');
    if (!backBtn) return;
    
    const showBack = ['screenDetail', 'screenTimer', 'screenComplete', 'screenHistory', 'screenGateway'].includes(screenId);
    backBtn.classList.toggle('visible', showBack);
}

export function goBack() {
    const prevScreens = {
        'screenDetail': 'screenBrowse',
        'screenTimer': 'screenDetail',
        'screenComplete': 'screenBrowse',
        'screenHistory': 'screenBrowse',
        'screenGateway': 'screenSetup'
    };
    
    const prev = prevScreens[currentScreen] || 'screenBrowse';
    showScreen(prev);
}

export async function initApp() {
    const result = await initClerk();
    
    if (result.demo) {
        const email = localStorage.getItem('demo_email');
        if (email) {
            userProfile = { email, demo: true };
            showScreen('screenSetup');
        } else {
            showScreen('screenLogin');
        }
        return;
    }
    
    if (result.user) {
        userProfile = result.user;
        setAuthToken(await getClerkToken());
        await ensureUserProfile(result.user);
        showScreen('screenSetup');
    } else {
        showScreen('screenLogin');
    }
    
    onClerkReady(async (user) => {
        userProfile = user;
        setAuthToken(await getClerkToken());
        await ensureUserProfile(user);
        showScreen('screenSetup');
    });
}

async function getClerkToken() {
    const { session } = await import('./components/login.js');
    if (session) {
        return session.getToken();
    }
    return null;
}

async function ensureUserProfile(user) {
    try {
        await createOrUpdateUser(user.id, {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
        });
    } catch (error) {
        console.error('Failed to sync user profile:', error);
    }
}

window.showScreen = showScreen;
window.goBack = goBack;

window.handleLogin = async function() {
    openSignIn();
};

window.handleSignup = async function() {
    openSignUp();
};

window.handleDemoMode = async function() {
    const demoEmail = 'demo@grind.app';
    localStorage.setItem('demo_email', demoEmail);
    userProfile = { email: demoEmail, demo: true };
    showScreen('screenSetup');
};

window.handleSignOut = async function() {
    await signOut();
    localStorage.removeItem('demo_email');
    userProfile = null;
    setAuthToken(null);
    showScreen('screenLogin');
};

export { userProfile, getCurrentUser };
