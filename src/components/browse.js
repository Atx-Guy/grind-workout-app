import { WORKOUTS, EQUIPMENT, CATEGORIES, filterWorkouts } from '../workout.js';
import { createWorkoutCard, createFilterPill, createEquipmentChip } from '../ui.js';
import { storage } from '../storage.js';

export function renderBrowseScreen(container, onWorkoutSelect, onOpenGenerator, onOpenHistory) {
  let selectedEquipment = storage.get('equipment', []);
  let selectedCategory = 'All';
  
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
  
  const equipBar = document.getElementById('equipBar');
  const filterBar = document.getElementById('filterBar');
  const workoutGrid = document.getElementById('workoutGrid');
  const aiBtn = document.getElementById('aiGenerateBtn');
  
  EQUIPMENT.forEach(equip => {
    const isActive = selectedEquipment.includes(equip.name);
    const chip = document.createElement('button');
    chip.className = `equip-chip ${isActive ? 'on' : ''}`;
    chip.innerHTML = `${equip.icon} ${equip.name}<span class="chip-x">×</span>`;
    chip.addEventListener('click', () => {
      chip.classList.toggle('on');
      if (chip.classList.contains('on')) {
        selectedEquipment.push(equip.name);
      } else {
        selectedEquipment = selectedEquipment.filter(e => e !== equip.name);
      }
      storage.set('equipment', selectedEquipment);
      renderWorkouts();
    });
    equipBar.appendChild(chip);
  });
  
  CATEGORIES.forEach(category => {
    const pill = document.createElement('button');
    pill.className = `filter-pill ${category === selectedCategory ? 'active' : ''}`;
    pill.textContent = category;
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedCategory = category;
      renderWorkouts();
    });
    filterBar.appendChild(pill);
  });
  
  aiBtn?.addEventListener('click', onOpenGenerator);
  
  function renderWorkouts() {
    const filtered = filterWorkouts(WORKOUTS, selectedEquipment, selectedCategory);
    if (filtered.length === 0) {
      workoutGrid.innerHTML = `
        <div class="no-workouts-msg">
          <div class="nw-icon">🏋️</div>
          <div class="nw-title">NO MATCHING WORKOUTS</div>
          <div>Try adjusting your equipment filters or skip to see all workouts.</div>
        </div>
      `;
      return;
    }
    workoutGrid.innerHTML = filtered.map(w => createWorkoutCard(w)).join('');
    workoutGrid.querySelectorAll('.workout-card').forEach(card => {
      card.addEventListener('click', () => {
        const workout = WORKOUTS.find(w => w.id === card.dataset.workoutId);
        if (workout) onWorkoutSelect(workout);
      });
    });
  }
  
  renderWorkouts();
}