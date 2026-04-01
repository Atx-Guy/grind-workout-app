import { EQUIPMENT } from '../config.js';

export function renderLoginScreenHTML() {
    return `
        <div class="login-screen">
            <div class="login-icon">💪</div>
            <div class="login-title">GRIND</div>
            <div class="login-subtitle">Sign in to sync your workouts and equipment across devices</div>
            
            <div class="login-form">
                <input type="email" id="loginEmail" class="login-input" placeholder="Email" />
                <input type="password" id="loginPassword" class="login-input" placeholder="Password" />
                <button id="loginBtn" class="login-btn">SIGN IN</button>
                
                <div class="login-divider">or</div>
                
                <button id="signupBtn" class="login-btn" style="background: var(--bg-card); color: var(--text); border: 1px solid var(--border);">CREATE ACCOUNT</button>
                
                <div id="loginError" class="login-error" style="display: none;"></div>
                
                <div class="login-toggle">
                    <a id="skipLoginLink">Continue without account →</a>
                </div>
            </div>
        </div>
    `;
}

export function renderSetupScreenHTML() {
    return `
        <div class="setup-screen">
            <div class="setup-icon">🏋️</div>
            <div class="setup-title">WHAT'S IN YOUR GYM?</div>
            <div class="setup-subtitle">Select the equipment you have at home. We'll show you workouts that match your gear.</div>

            <div class="setup-equipment-grid" id="setupGrid"></div>

            <button class="setup-go-btn" id="setupGoBtn" disabled>LET'S GO</button>
            <button class="setup-skip" id="setupSkipBtn">Skip — show me everything</button>
        </div>
    `;
}

export function renderSetupGrid(myEquipment) {
    const selected = new Set([...myEquipment]);
    return EQUIPMENT.map(eq => `
        <div class="equip-toggle ${selected.has(eq.id) || eq.alwaysOn ? 'active' : ''}" data-equip="${eq.id}">
            <div class="equip-toggle-icon">${eq.icon}</div>
            <div class="equip-toggle-info">
                <div class="equip-toggle-name">${eq.name}</div>
                <div class="equip-toggle-desc">${eq.desc}</div>
            </div>
            <div class="equip-toggle-check">✓</div>
        </div>
    `).join('');
}

export function renderLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

export function clearLoginError() {
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

export function updateUserProfile(user) {
    const userProfile = document.getElementById('userProfile');
    if (userProfile && user) {
        userProfile.innerHTML = `
            <div class="user-profile">
                <span class="user-email">${user.email}</span>
                <button class="history-btn" id="openHistoryBtn">History</button>
                <button class="logout-btn" id="logoutBtn">Logout</button>
            </div>
        `;
        userProfile.style.display = 'block';
    }
}

export function hideUserProfile() {
    const userProfile = document.getElementById('userProfile');
    if (userProfile) {
        userProfile.style.display = 'none';
        userProfile.innerHTML = '';
    }
}
