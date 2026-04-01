import { renderGenChips, generateWorkout } from '../js/workout.js';

export function renderGeneratorScreenHTML() {
    return `
        <div class="gen-container">
            <div class="gen-hero">
                <div class="gen-hero-icon">✨</div>
                <div class="gen-hero-title">AI WORKOUT GENERATOR</div>
                <div class="gen-hero-sub">Describe what you want and AI will build a custom timed workout for you.</div>
            </div>

            <div class="gen-label">QUICK IDEAS</div>
            <div class="gen-chips" id="genChips"></div>

            <div class="gen-label" style="margin-top:4px">YOUR REQUEST</div>
            <div class="gen-input-wrap">
                <textarea class="gen-input" id="genInput" placeholder="e.g. 20 min upper body with bands, focus on shoulders..." rows="2"></textarea>
                <button class="gen-send-btn" id="genSendBtn">⚡</button>
            </div>

            <div id="genOutput"></div>
        </div>
    `;
}

export function initGeneratorScreen(app) {
    const genInput = document.getElementById('genInput');
    const genOutput = document.getElementById('genOutput');
    if (genInput) genInput.value = '';
    if (genOutput) genOutput.innerHTML = '';
    renderGenChips(app);

    const genInputEl = document.getElementById('genInput');
    if (genInputEl) {
        genInputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                generateWorkout(app);
            }
        });
    }

    const genSendBtn = document.getElementById('genSendBtn');
    if (genSendBtn) {
        genSendBtn.addEventListener('click', () => generateWorkout(app));
    }
}
