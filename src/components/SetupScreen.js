import { EQUIPMENT } from '../js/workout.js';

export function renderSetupScreen(container) {
    container.innerHTML = `
        <div class="screen" id="screenSetup">
            <div class="setup-screen">
                <div class="setup-icon">🏋️</div>
                <div class="setup-title">WHAT'S IN YOUR GYM?</div>
                <div class="setup-subtitle">Select the equipment you have at home. We'll show you workouts that match your gear.</div>

                <div class="setup-equipment-grid" id="setupGrid"></div>

                <button class="setup-go-btn" id="setupGoBtn" disabled>LET'S GO</button>
                <button class="setup-skip">Skip — show me everything</button>
            </div>
        </div>
    `;

    const grid = container.querySelector('#setupGrid');
    grid.innerHTML = EQUIPMENT.map(eq => `
        <div class="equip-toggle ${eq.alwaysOn ? 'active' : ''}" data-equip="${eq.id}">
            <div class="equip-toggle-icon">${eq.icon}</div>
            <div class="equip-toggle-info">
                <div class="equip-toggle-name">${eq.name}</div>
                <div class="equip-toggle-desc">${eq.desc}</div>
            </div>
            <div class="equip-toggle-check">✓</div>
        </div>
    `).join('');

    return {
        grid,
        goBtn: container.querySelector('#setupGoBtn'),
        skipBtn: container.querySelector('.setup-skip'),
    };
}
