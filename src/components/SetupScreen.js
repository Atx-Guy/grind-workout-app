import { EQUIPMENT } from '../config.js';
import { finishSetup, skipSetup } from '../js/app.js';

export function renderSetupScreen(app) {
    const grid = document.getElementById('setupGrid');
    if (!grid) return;

    const selected = new Set([...app.state.myEquipment]);
    grid.innerHTML = EQUIPMENT.map(eq => `
        <div class="equip-toggle ${selected.has(eq.id) || eq.alwaysOn ? 'active' : ''}" data-equip="${eq.id}">
            <div class="equip-toggle-icon">${eq.icon}</div>
            <div class="equip-toggle-info">
                <div class="equip-toggle-name">${eq.name}</div>
                <div class="equip-toggle-desc">${eq.desc}</div>
            </div>
            <div class="equip-toggle-check">✓</div>
        </div>
    `).join('');

    grid.querySelectorAll('.equip-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const id = toggle.dataset.equip;
            const eq = EQUIPMENT.find(e => e.id === id);
            if (eq && !eq.alwaysOn) {
                toggle.classList.toggle('active');
                updateSetupBtn();
            }
        });
    });

    updateSetupBtn();
}

function updateSetupBtn() {
    const grid = document.getElementById('setupGrid');
    if (!grid) return;
    const active = grid.querySelectorAll('.equip-toggle.active');
    const setupGoBtn = document.getElementById('setupGoBtn');
    if (setupGoBtn) {
        setupGoBtn.disabled = active.length === 0;
    }
}

export function setupSetupEventListeners(app) {
    const setupGoBtn = document.getElementById('setupGoBtn');
    if (setupGoBtn) {
        setupGoBtn.addEventListener('click', () => {
            const grid = document.getElementById('setupGrid');
            if (!grid) return;
            const selectedEquipment = [];
            grid.querySelectorAll('.equip-toggle.active').forEach(toggle => {
                selectedEquipment.push(toggle.dataset.equip);
            });
            finishSetup(app, selectedEquipment);
        });
    }

    const setupSkipBtn = document.getElementById('setupSkipBtn');
    if (setupSkipBtn) {
        setupSkipBtn.addEventListener('click', () => skipSetup(app));
    }
}
