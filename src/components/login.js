import { storage } from '../storage.js';
import { setAuthToken } from '../api.js';

export function renderLoginScreen(container) {
  container.innerHTML = `
    <div class="screen active" id="screenLogin">
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
            <a id="skipLoginBtn">Continue without account →</a>
          </div>
        </div>
      </div>
    </div>
  `;
  setupLoginHandlers();
}

function setupLoginHandlers() {
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const skipBtn = document.getElementById('skipLoginBtn');
  const loginError = document.getElementById('loginError');
  
  loginBtn?.addEventListener('click', async () => {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    if (!email || !password) {
      loginError.style.display = 'block';
      loginError.textContent = 'Please enter email and password';
      return;
    }
    loginError.style.display = 'none';
    loginBtn.textContent = 'LOADING...';
    loginBtn.disabled = true;
    // Demo mode - in production use Clerk
    storage.set('user', { email, demo: true });
    window.location.reload();
  });
  
  signupBtn?.addEventListener('click', () => {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    if (!email || !password) {
      loginError.style.display = 'block';
      loginError.textContent = 'Please enter email and password';
      return;
    }
    storage.set('user', { email, demo: true });
    window.location.reload();
  });
  
  skipBtn?.addEventListener('click', () => {
    storage.set('setup_complete', true);
    storage.set('equipment', []);
    storage.set('user', { demo: true });
    window.location.reload();
  });
}