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
                        <a>Continue without account →</a>
                    </div>
                </div>
            </div>
        </div>
    `;

    return {
        emailInput: container.querySelector('#loginEmail'),
        passwordInput: container.querySelector('#loginPassword'),
        loginBtn: container.querySelector('#loginBtn'),
        signupBtn: container.querySelector('#signupBtn'),
        errorDiv: container.querySelector('#loginError'),
        skipLink: container.querySelector('.login-toggle a'),
    };
}
