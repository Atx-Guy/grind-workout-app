export function createWorkoutCard(workout, onClick) {
  const intensityClass = `badge-intensity-${workout.intensity}`;
  return `
    <div class="workout-card" data-workout-id="${workout.id}">
      <div class="workout-card-top">
        <div class="workout-card-title">${workout.title}</div>
        <div class="workout-card-badge">
          <span class="badge badge-time">${workout.duration} MIN</span>
          <span class="badge ${intensityClass}">${workout.intensity.toUpperCase()}</span>
        </div>
      </div>
      <div class="workout-card-desc">${workout.desc}</div>
      <div class="workout-card-muscles">${workout.muscles}</div>
      <div class="workout-card-meta">${workout.equipment.join(' · ')}</div>
    </div>
  `;
}

export function createFilterPill(category, isActive) {
  return `
    <button class="filter-pill ${isActive ? 'active' : ''}" data-category="${category}">
      ${category}
    </button>
  `;
}

export function createEquipmentChip(equip, isActive, onClick) {
  return `
    <button class="equip-chip ${isActive ? 'on' : ''}" data-equipment="${equip.name}">
      ${equip.icon} ${equip.name}
      <span class="chip-x">×</span>
    </button>
  `;
}

export function createEquipmentToggle(equip, isActive, onClick) {
  return `
    <div class="equip-toggle ${isActive ? 'active' : ''}" data-equipment="${equip.name}">
      <div class="equip-toggle-icon">${equip.icon}</div>
      <div class="equip-toggle-info">
        <div class="equip-toggle-name">${equip.name}</div>
        <div class="equip-toggle-desc">${equip.desc}</div>
      </div>
      <div class="equip-toggle-check">✓</div>
    </div>
  `;
}

export function createExerciseListItem(exercise, index) {
  if (exercise.type === 'rest') {
    return `
      <div class="exercise-list-item rest-item">
        <div class="el-num">${index + 1}</div>
        <div class="el-name">Rest</div>
        <div class="el-detail">${exercise.duration}s</div>
      </div>
    `;
  }
  return `
    <div class="exercise-list-item">
      <div class="el-num">${index + 1}</div>
      <div class="el-name">${exercise.name}</div>
      <div class="el-detail">${exercise.duration}s ${exercise.reps ? `· ${exercise.reps}` : ''}</div>
    </div>
  `;
}

export function createHistoryItem(item) {
  const date = new Date(item.completed_at).toLocaleDateString();
  return `
    <div class="history-item">
      <div class="history-item-info">
        <div class="history-item-title">${item.title}</div>
        <div class="history-item-meta">${item.category} · ${date}</div>
      </div>
      <div class="history-item-duration">${item.duration || item.total_time} MIN</div>
    </div>
  `;
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'gen-error';
  errorDiv.innerHTML = `<strong>Error:</strong> ${message}`;
  return errorDiv;
}
