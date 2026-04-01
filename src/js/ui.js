import { EQUIPMENT, CATEGORIES, CIRCUMFERENCE, WORKOUTS } from './workout.js';
import * as app from './app.js';

export function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id)?.classList.add('active');
    const showBack = id !== 'screenBrowse' && id !== 'screenSetup' && id !== 'screenLogin';
    document.getElementById('backBtn')?.classList.toggle('visible', showBack);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function renderSetup() {
    const grid = document.getElementById('setupGrid');
    if (!grid) return;
    
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

    grid.querySelectorAll('.equip-toggle').forEach(el => {
        el.addEventListener('click', () => {
            const alwaysOn = el.dataset.equip === 'Bodyweight';
            if (alwaysOn) return;
            el.classList.toggle('active');
        });
    });

    updateSetupBtn();
}

function updateSetupBtn() {
    const active = document.querySelectorAll('#setupGrid .equip-toggle.active');
    const btn = document.getElementById('setupGoBtn');
    if (btn) btn.disabled = active.length === 0;
}

export function renderEquipBar() {
    const bar = document.getElementById('equipBar');
    if (!bar) return;
    
    bar.innerHTML = EQUIPMENT.map(eq => {
        const on = app.AppState.myEquipment.has(eq.id);
        return `<button class="equip-chip ${on ? 'on' : ''}" data-equip="${eq.id}">
            ${eq.icon} ${eq.id}${!eq.alwaysOn ? ` <span class="chip-x">${on ? '✕' : '+'}</span>` : ''}
        </button>`;
    }).join('');

    bar.querySelectorAll('.equip-chip').forEach(el => {
        el.addEventListener('click', () => {
            const id = el.dataset.equip;
            const eq = EQUIPMENT.find(e => e.id === id);
            app.toggleEquip(id, eq?.alwaysOn);
            renderEquipBar();
            renderWorkoutGrid();
        });
    });
}

export function renderFilters() {
    const bar = document.getElementById('filterBar');
    if (!bar) return;
    
    bar.innerHTML = CATEGORIES.map(c =>
        `<button class="filter-pill ${c === app.AppState.activeFilter ? 'active' : ''}" data-cat="${c}">${c}</button>`
    ).join('');

    bar.querySelectorAll('.filter-pill').forEach(el => {
        el.addEventListener('click', () => {
            app.setFilter(el.dataset.cat);
            renderFilters();
            renderWorkoutGrid();
        });
    });
}

export function renderWorkoutGrid() {
    const grid = document.getElementById('workoutGrid');
    if (!grid) return;
    
    const filtered = app.getFilteredWorkouts();

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
        <div class="workout-card" data-id="${w.id}">
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

    grid.querySelectorAll('.workout-card').forEach(el => {
        el.addEventListener('click', () => {
            app.openDetail(el.dataset.id);
            renderDetail();
            showScreen('screenDetail');
        });
    });
}

export function renderDetail() {
    const workout = app.AppState.selectedWorkout;
    if (!workout) return;

    const titleEl = document.getElementById('detailTitle');
    const metaEl = document.getElementById('detailMeta');
    const listEl = document.getElementById('exerciseList');

    if (titleEl) titleEl.textContent = workout.title;

    if (metaEl) {
        const totalSec = workout.steps.reduce((s, e) => s + e.duration, 0);
        const exerciseCount = workout.steps.filter(s => s.type === 'exercise').length;
        metaEl.innerHTML = `
            <div class="detail-meta-item"><strong>${Math.round(totalSec / 60)}</strong> min</div>
            <div class="detail-meta-item"><strong>${exerciseCount}</strong> exercises</div>
            <div class="detail-meta-item"><strong>${workout.intensity}</strong></div>
        `;
    }

    if (listEl) {
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
        listEl.innerHTML = html;
    }
}

export function updateTimerDisplay() {
    const steps = app.AppState.selectedWorkout?.steps;
    if (!steps) return;

    const current = steps[app.AppState.currentIndex];

    document.getElementById('timerPhase').textContent = current.phase;
    document.getElementById('timerExName').textContent = current.name;

    if (current.type === 'rest') {
        document.getElementById('timerExInfo').textContent = 'Rest — breathe';
    } else if (current.set) {
        document.getElementById('timerExInfo').textContent = `Set ${current.set} · ${current.reps} reps`;
    } else {
        document.getElementById('timerExInfo').textContent = current.tips || 'Go!';
    }

    const mins = Math.floor(app.AppState.timeLeft / 60);
    const secs = app.AppState.timeLeft % 60;
    document.getElementById('timerTime').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

    const ring = document.getElementById('timerRingFg');
    const fraction = app.AppState.timeLeft / current.duration;
    ring.style.strokeDashoffset = CIRCUMFERENCE * (1 - fraction);
    ring.classList.toggle('rest', current.type === 'rest');

    document.getElementById('timerSet').textContent = current.set ? `Set ${current.set}` : '';

    const totalDuration = steps.reduce((s, e) => s + e.duration, 0);
    const elapsed = totalDuration - steps.slice(app.AppState.currentIndex).reduce((s, e) => s + e.duration, 0) + (steps[app.AppState.currentIndex].duration - app.AppState.timeLeft);
    const pct = Math.round((elapsed / totalDuration) * 100);
    document.getElementById('timerProgressFill').style.width = pct + '%';
    document.getElementById('timerProgressText').textContent = `${pct}% Complete · Exercise ${app.AppState.currentIndex + 1} of ${steps.length}`;

    const nextBox = document.getElementById('timerNextUp');
    if (app.AppState.currentIndex < steps.length - 1) {
        nextBox.style.display = 'flex';
        document.getElementById('timerNextName').textContent = steps[app.AppState.currentIndex + 1].name;
    } else {
        nextBox.style.display = 'none';
    }

    document.getElementById('btnPlay').textContent = app.AppState.isRunning ? 'PAUSE' : 'PLAY';
    document.getElementById('btnPlay').className = app.AppState.isRunning ? 'timer-btn btn-pause' : 'timer-btn btn-play';
}

export function renderUserProfile() {
    const userProfile = document.getElementById('userProfile');
    if (!userProfile) return;

    if (app.AppState.currentUser) {
        userProfile.innerHTML = `
            <div class="user-profile">
                <span class="user-email">${app.AppState.currentUser.email}</span>
                <button class="history-btn" id="historyBtn">History</button>
                <button class="logout-btn" id="logoutBtn">Logout</button>
            </div>
        `;
        userProfile.style.display = 'block';

        document.getElementById('historyBtn')?.addEventListener('click', () => {
            window.location.hash = 'history';
        });
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            app.handleLogout();
            renderUserProfile();
            showScreen('screenLogin');
        });
    } else {
        userProfile.style.display = 'none';
        userProfile.innerHTML = '';
    }
}

export function renderGenChips() {
    const chipsEl = document.getElementById('genChips');
    if (!chipsEl) return;

    const suggestions = [
        '15 min Tabata core burner, no equipment',
        '20 min HIIT full body with bands',
        '30 min high intensity full body, bodyweight only',
        '15 min upper body push/pull with bands',
        '25 min lower body with short & long bands',
    ];

    chipsEl.innerHTML = suggestions.map(s =>
        `<button class="gen-chip">${s}</button>`
    ).join('');

    chipsEl.querySelectorAll('.gen-chip').forEach(el => {
        el.addEventListener('click', () => {
            const genInput = document.getElementById('genInput');
            if (genInput) genInput.value = el.textContent;
        });
    });
}

export function renderCompleteScreen() {
    const workout = app.AppState.selectedWorkout;
    if (!workout) return;

    const elapsed = Math.round((Date.now() - app.AppState.workoutStartTime) / 1000);
    const mins = Math.floor(elapsed / 60);

    const statEl = document.getElementById('completeStat');
    if (statEl) {
        statEl.innerHTML = `<strong>${workout.title}</strong> completed in <strong>${mins} min</strong>`;
    }
}

export function renderHistoryScreen() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    if (!app.AppState.currentUser) {
        historyList.innerHTML = '<div class="history-empty">Please sign in to view your workout history.</div>';
        return;
    }

    historyList.innerHTML = '<div class="history-loading">Loading history...</div>';

    import('./api.js').then(api => {
        api.fetchWorkoutHistory()
            .then(data => {
                if (!data.history || data.history.length === 0) {
                    historyList.innerHTML = '<div class="history-empty">No workouts completed yet.</div>';
                    return;
                }

                const workoutMap = {};
                WORKOUTS.forEach(w => { workoutMap[w.id] = w.title; });

                let html = '';
                data.history.forEach(item => {
                    const workoutTitle = workoutMap[item.workoutId] || 'Unknown Workout';
                    const mins = Math.floor(item.duration / 60);
                    const secs = item.duration % 60;
                    const durationStr = secs > 0 ? `${mins}:${secs.toString().padStart(2, '0')} min` : `${mins} min`;
                    const dateStr = item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 'Recently';

                    html += `
                        <div class="history-item">
                            <div class="history-item-info">
                                <div class="history-item-title">${workoutTitle}</div>
                                <div class="history-item-meta">${dateStr}</div>
                            </div>
                            <div class="history-item-duration">${durationStr}</div>
                        </div>
                    `;
                });
                historyList.innerHTML = html;
            })
            .catch(() => {
                historyList.innerHTML = '<div class="history-empty">Error loading history.</div>';
            });
    });
}

export function updateSoundToggle() {
    const toggle = document.getElementById('soundToggle');
    if (toggle) {
        toggle.textContent = app.AppState.soundEnabled ? '🔊' : '🔇';
    }
}
