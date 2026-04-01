import { EQUIPMENT, CATEGORIES } from '../js/workout.js';

export function renderBrowseScreen(container) {
    container.innerHTML = `
        <div class="screen" id="screenBrowse">
            <div class="equip-bar-label">MY EQUIPMENT</div>
            <div class="equip-bar" id="equipBar"></div>
            <div class="filter-bar" id="filterBar"></div>
            <button class="ai-generate-btn" id="aiGenerateBtn">
                <span class="ai-sparkle">✨</span>
                <span class="ai-label">AI Workout Generator</span>
                <span class="ai-arrow">→</span>
            </button>
            <div class="workout-grid" id="workoutGrid"></div>
        </div>
    `;

    const equipBar = container.querySelector('#equipBar');
    equipBar.innerHTML = EQUIPMENT.map(eq => {
        return `<button class="equip-chip on" data-equip="${eq.id}">
            ${eq.icon} ${eq.id} <span class="chip-x">✕</span>
        </button>`;
    }).join('');

    const filterBar = container.querySelector('#filterBar');
    filterBar.innerHTML = CATEGORIES.map(c =>
        `<button class="filter-pill ${c === 'All' ? 'active' : ''}" data-cat="${c}">${c}</button>`
    ).join('');

    return {
        equipBar,
        filterBar,
        workoutGrid: container.querySelector('#workoutGrid'),
        aiGenerateBtn: container.querySelector('#aiGenerateBtn'),
    };
}
