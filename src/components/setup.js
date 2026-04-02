import { EQUIPMENT } from '../workout.js';
import { createEquipmentToggle } from '../ui.js';
import { storage } from '../storage.js';

export function renderSetupScreen(container, onComplete) {
  let selectedEquipment = storage.get('equipment', []);
  
  container.innerHTML = `
    <div class="screen" id="screenSetup">
      <div class="setup-screen">
        <div class="setup-icon">🏋️</div>
        <div class="setup-title">WHAT'S IN YOUR GYM?</div>
        <div class="setup-subtitle">Select the equipment you have at home. We'll show you workouts that match your gear.</div>
        <div class="setup-equipment-grid" id="setupGrid"></div>
        <button class="setup-go-btn" id="setupGoBtn" disabled>LET'S GO</button>
        <button class="setup-skip" id="setupSkipBtn">Skip — show me everything</button>
      </div>
    </div>
  `;
  
  const grid = document.getElementById('setupGrid');
  const goBtn = document.getElementById('setupGoBtn');
  const skipBtn = document.getElementById('setupSkipBtn');
  
  EQUIPMENT.forEach(equip => {
    const isActive = selectedEquipment.includes(equip.name);
    const el = document.createElement('div');
    el.innerHTML = createEquipmentToggle(equip, isActive);
    const toggle = el.firstElementChild;
    grid.appendChild(toggle);
    
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      if (toggle.classList.contains('active')) {
        selectedEquipment.push(equip.name);
      } else {
        selectedEquipment = selectedEquipment.filter(e => e !== equip.name);
      }
      goBtn.disabled = selectedEquipment.length === 0;
    });
  });
  
  goBtn.addEventListener('click', () => {
    storage.set('equipment', selectedEquipment);
    storage.set('setup_complete', true);
    onComplete();
  });
  
  skipBtn.addEventListener('click', () => {
    storage.set('equipment', []);
    storage.set('setup_complete', true);
    onComplete();
  });
}