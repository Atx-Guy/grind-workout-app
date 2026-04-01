import { EQUIPMENT, CATEGORIES } from '../config.js';
import { getFilteredWorkouts, showScreen } from './app.js';

export function renderEquipBar(app) {
    const bar = document.getElementById('equipBar');
    if (!bar) return;

    bar.innerHTML = EQUIPMENT.map(eq => {
        const on = app.state.myEquipment.has(eq.id);
        return `<button class="equip-chip ${on ? 'on' : ''}" data-equip="${eq.id}">
            ${eq.icon} ${eq.id}${!eq.alwaysOn ? ` <span class="chip-x">${on ? '✕' : '+'}</span>` : ''}
        </button>`;
    }).join('');

    bar.querySelectorAll('.equip-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const id = chip.dataset.equip;
            const eq = EQUIPMENT.find(e => e.id === id);
            if (eq && !eq.alwaysOn) {
                if (app.state.myEquipment.has(id)) {
                    app.state.myEquipment.delete(id);
                } else {
                    app.state.myEquipment.add(id);
                }
                localStorage.setItem('grind_equipment', JSON.stringify([...app.state.myEquipment]));
                renderEquipBar(app);
                renderWorkoutGrid(app);
            }
        });
    });
}

export function renderFilters(app) {
    const bar = document.getElementById('filterBar');
    if (!bar) return;

    bar.innerHTML = CATEGORIES.map(c =>
        `<button class="filter-pill ${c === app.state.activeFilter ? 'active' : ''}" data-cat="${c}">${c}</button>`
    ).join('');

    bar.querySelectorAll('.filter-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            app.state.activeFilter = pill.dataset.cat;
            renderFilters(app);
            renderWorkoutGrid(app);
        });
    });
}

export function renderWorkoutGrid(app) {
    const grid = document.getElementById('workoutGrid');
    if (!grid) return;

    const filtered = getFilteredWorkouts(app);

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="no-workouts-msg">
            <div class="nw-icon">🔍</div>
            <div class="nw-title">NO MATCHING WORKOUTS</div>
            Toggle more equipment above or switch category to see workouts.
        </div>`;
        return;
    }

    grid.innerHTML = filtered.map(w => {
        const intensityClass = w.intensity === 'high' ? 'badge-intensity-high' : w.intensity === 'medium' ? 'badge-intensity-med' : 'badge-intensity-low';
        return `
        <div class="workout-card" data-workout-id="${w.id}">
            <div class="workout-card-top">
                <div class="workout-card-title">${w.title}</div>
                <div class="workout-card-badge">
                    <span class="badge badge-time">${w.duration} min</span>
                    <span class="badge ${intensityClass}">${w.intensity}</span>
                </div>
            </div>
            <div class="workout-card-meta">${w.category}</div>
        </div>`;
    }).join('');

    grid.querySelectorAll('.workout-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.workoutId;
            const workout = filtered.find(w => w.id === id);
            if (workout) {
                app.state.selectedWorkout = workout;
                showDetail(app, workout);
            }
        });
    });
}

export function showDetail(app, workout) {
    const detailTitle = document.getElementById('detailTitle');
    const detailMeta = document.getElementById('detailMeta');
    const exerciseList = document.getElementById('exerciseList');

    if (detailTitle) detailTitle.textContent = workout.title;

    const totalSec = workout.steps.reduce((s, e) => s + e.duration, 0);
    const exerciseCount = workout.steps.filter(s => s.type === 'exercise').length;
    if (detailMeta) {
        detailMeta.innerHTML = `
            <div class="detail-meta-item"><strong>${Math.round(totalSec / 60)}</strong> min</div>
            <div class="detail-meta-item"><strong>${exerciseCount}</strong> exercises</div>
            <div class="detail-meta-item"><strong>${workout.intensity}</strong></div>
        `;
    }

    if (exerciseList) {
        let html = '';
        let lastPhase = '';
        let num = 0;

        workout.steps.forEach(step => {
            if (step.phase !== lastPhase) {
                html += `<div class="exercise-list-item phase-header">${step.phase}</div>`;
                lastPhase = step.phase;
            }
            if (step.type === 'rest') {
                html += `<div class="exercise-list-item rest-item">
                    <div class="el-num">—</div>
                    <div class="el-name">Rest</div>
                    <div class="el-detail">${step.duration}s</div>
                </div>`;
            } else {
                num++;
                const detail = step.set ? `Set ${step.set} · ${step.reps} reps` : (step.tips || `${step.duration}s`);
                html += `<div class="exercise-list-item">
                    <div class="el-num">${num}</div>
                    <div class="el-name">${step.name}</div>
                    <div class="el-detail">${detail}</div>
                </div>`;
            }
        });
        exerciseList.innerHTML = html;
    }

    showScreen('screenDetail', app);
}
