import { openGenerator, renderGenChips } from '../js/workout.js';
import { renderEquipBar, renderFilters, renderWorkoutGrid } from '../js/ui.js';

export function renderBrowseScreenHTML() {
    return `
        <div class="equip-bar-label">MY EQUIPMENT</div>
        <div class="equip-bar" id="equipBar"></div>
        <div class="filter-bar" id="filterBar"></div>
        <button class="ai-generate-btn" id="aiGenerateBtn">
            <span class="ai-sparkle">✨</span>
            <span class="ai-label">AI Workout Generator</span>
            <span class="ai-arrow">→</span>
        </button>
        <div class="workout-grid" id="workoutGrid"></div>
    `;
}

export function renderBrowseContent(app) {
    renderEquipBar(app);
    renderFilters(app);
    renderWorkoutGrid(app);
}

export function setupBrowseEventListeners(app) {
    const aiGenerateBtn = document.getElementById('aiGenerateBtn');
    if (aiGenerateBtn) {
        aiGenerateBtn.addEventListener('click', () => {
            openGenerator(app);
            renderGenChips(app);
        });
    }
}
