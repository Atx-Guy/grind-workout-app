import { EQUIPMENT, CATEGORIES, CIRCUMFERENCE, WORKOUTS } from '../config.js';
import { saveEquipment, isSetupDone, markSetupDone, saveWorkoutState, loadWorkoutState, clearWorkoutState } from './storage.js';

export function initApp() {
    const app = {
        state: {
            activeFilter: 'All',
            selectedWorkout: null,
            currentIndex: 0,
            timeLeft: 0,
            isRunning: false,
            intervalId: null,
            soundEnabled: true,
            workoutStartTime: null,
            myEquipment: new Set(loadEquipment() || EQUIPMENT.map(e => e.id)),
            currentScreen: 'screenLogin',
            currentUser: null,
        }
    };

    return app;
}

export function showScreen(screenId, app) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
        app.state.currentScreen = screenId;
    }

    const showBack = !['screenBrowse', 'screenSetup', 'screenLogin'].includes(screenId);
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.classList.toggle('visible', showBack);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function goHome(app) {
    if (app.state.isRunning) {
        stopWorkout(app);
    }
    app.state.activeFilter = 'All';
    showScreen('screenBrowse', app);
}

export function toggleSound(app) {
    app.state.soundEnabled = !app.state.soundEnabled;
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.textContent = app.state.soundEnabled ? '🔊' : '🔇';
    }
}

export function speak(app, text) {
    if (!app.state.soundEnabled || !('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.15;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
}

export function toggleEquip(app, id) {
    const eq = EQUIPMENT.find(e => e.id === id);
    if (!eq || eq.alwaysOn) return;

    if (app.state.myEquipment.has(id)) {
        app.state.myEquipment.delete(id);
    } else {
        app.state.myEquipment.add(id);
    }
    saveEquipment(app.state.myEquipment);
}

export function setFilter(app, cat) {
    app.state.activeFilter = cat;
}

export function openDetail(app, workout) {
    app.state.selectedWorkout = workout;
    showScreen('screenDetail', app);
}

export function startWorkout(app) {
    if (!app.state.selectedWorkout) return;
    app.state.currentIndex = 0;
    app.state.timeLeft = app.state.selectedWorkout.steps[0].duration;
    app.state.isRunning = false;
    app.state.workoutStartTime = Date.now();
    saveWorkoutState({
        selectedWorkout: app.state.selectedWorkout,
        currentIndex: 0,
        timeLeft: app.state.timeLeft,
        workoutStartTime: app.state.workoutStartTime
    });
    showScreen('screenTimer', app);
    togglePlay(app);
}

export function togglePlay(app) {
    if (app.state.isRunning) {
        clearInterval(app.state.intervalId);
        app.state.isRunning = false;
        speak(app, 'Paused');
    } else {
        app.state.isRunning = true;
        const current = app.state.selectedWorkout.steps[app.state.currentIndex];
        if (current.type !== 'rest') speak(app, current.name);
        app.state.intervalId = setInterval(() => tick(app), 1000);
    }
    updateTimerDisplay(app);
    saveWorkoutState({
        selectedWorkout: app.state.selectedWorkout,
        currentIndex: app.state.currentIndex,
        timeLeft: app.state.timeLeft,
        workoutStartTime: app.state.workoutStartTime
    });
}

export function tick(app) {
    app.state.timeLeft--;
    if (app.state.timeLeft <= 3 && app.state.timeLeft > 0) {
        speak(app, String(app.state.timeLeft));
    }
    if (app.state.timeLeft <= 0) {
        advanceExercise(app);
    }
    updateTimerDisplay(app);
    saveWorkoutState({
        selectedWorkout: app.state.selectedWorkout,
        currentIndex: app.state.currentIndex,
        timeLeft: app.state.timeLeft,
        workoutStartTime: app.state.workoutStartTime
    });
}

export function advanceExercise(app) {
    app.state.currentIndex++;
    if (app.state.currentIndex >= app.state.selectedWorkout.steps.length) {
        completeWorkout(app);
        return;
    }
    const next = app.state.selectedWorkout.steps[app.state.currentIndex];
    app.state.timeLeft = next.duration;

    if (next.type === 'rest') {
        speak(app, 'Rest');
    } else if (next.set) {
        speak(app, `${next.name}, Set ${next.set}`);
    } else {
        speak(app, next.name);
    }
    saveWorkoutState({
        selectedWorkout: app.state.selectedWorkout,
        currentIndex: app.state.currentIndex,
        timeLeft: app.state.timeLeft,
        workoutStartTime: app.state.workoutStartTime
    });
}

export function skipExercise(app) {
    advanceExercise(app);
    updateTimerDisplay(app);
}

export function stopWorkout(app) {
    clearInterval(app.state.intervalId);
    app.state.isRunning = false;
    clearWorkoutState();
    showScreen('screenBrowse', app);
}

export function completeWorkout(app) {
    clearInterval(app.state.intervalId);
    app.state.isRunning = false;
    const elapsed = Math.round((Date.now() - app.state.workoutStartTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const completeStat = document.getElementById('completeStat');
    if (completeStat) {
        completeStat.innerHTML =
            `<strong>${app.state.selectedWorkout.title}</strong> completed in <strong>${mins} min</strong>`;
    }
    speak(app, 'Workout complete. Great job!');
    clearWorkoutState();
    showScreen('screenComplete', app);
}

export function updateTimerDisplay(app) {
    const steps = app.state.selectedWorkout.steps;
    const current = steps[app.state.currentIndex];

    const timerPhase = document.getElementById('timerPhase');
    const timerExName = document.getElementById('timerExName');
    const timerExInfo = document.getElementById('timerExInfo');
    const timerTime = document.getElementById('timerTime');
    const timerRingFg = document.getElementById('timerRingFg');
    const timerSet = document.getElementById('timerSet');
    const timerProgressFill = document.getElementById('timerProgressFill');
    const timerProgressText = document.getElementById('timerProgressText');
    const timerNextUp = document.getElementById('timerNextUp');
    const timerNextName = document.getElementById('timerNextName');
    const btnPlay = document.getElementById('btnPlay');

    if (timerPhase) timerPhase.textContent = current.phase;
    if (timerExName) timerExName.textContent = current.name;

    if (timerExInfo) {
        if (current.type === 'rest') {
            timerExInfo.textContent = 'Rest — breathe';
        } else if (current.set) {
            timerExInfo.textContent = `Set ${current.set} · ${current.reps} reps`;
        } else {
            timerExInfo.textContent = current.tips || 'Go!';
        }
    }

    const mins = Math.floor(app.state.timeLeft / 60);
    const secs = app.state.timeLeft % 60;
    if (timerTime) timerTime.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

    if (timerRingFg) {
        const fraction = app.state.timeLeft / current.duration;
        timerRingFg.style.strokeDashoffset = CIRCUMFERENCE * (1 - fraction);
        timerRingFg.classList.toggle('rest', current.type === 'rest');
    }

    if (timerSet) timerSet.textContent = current.set ? `Set ${current.set}` : '';

    const totalDuration = steps.reduce((s, e) => s + e.duration, 0);
    const elapsed = totalDuration - steps.slice(app.state.currentIndex).reduce((s, e) => s + e.duration, 0) + (steps[app.state.currentIndex].duration - app.state.timeLeft);
    const pct = Math.round((elapsed / totalDuration) * 100);
    if (timerProgressFill) timerProgressFill.style.width = pct + '%';
    if (timerProgressText) timerProgressText.textContent = `${pct}% Complete · Exercise ${app.state.currentIndex + 1} of ${steps.length}`;

    if (timerNextUp) {
        if (app.state.currentIndex < steps.length - 1) {
            timerNextUp.style.display = 'flex';
            if (timerNextName) timerNextName.textContent = steps[app.state.currentIndex + 1].name;
        } else {
            timerNextUp.style.display = 'none';
        }
    }

    if (btnPlay) {
        btnPlay.textContent = app.state.isRunning ? 'PAUSE' : 'PLAY';
        btnPlay.className = app.state.isRunning ? 'timer-btn btn-pause' : 'timer-btn btn-play';
    }
}

export function restoreWorkoutState(app) {
    const state = loadWorkoutState();
    if (!state || !state.selectedWorkout) {
        return false;
    }

    app.state.selectedWorkout = state.selectedWorkout;
    app.state.currentIndex = state.currentIndex || 0;
    app.state.timeLeft = state.timeLeft || 0;
    app.state.workoutStartTime = state.workoutStartTime;
    app.state.isRunning = false;

    showScreen('screenTimer', app);
    updateTimerDisplay(app);
    speak(app, 'Workout restored');
    return true;
}

export function finishSetup(app, selectedEquipment) {
    app.state.myEquipment = new Set(selectedEquipment);
    saveEquipment(app.state.myEquipment);
    markSetupDone();
    showScreen('screenBrowse', app);
}

export function skipSetup(app) {
    app.state.myEquipment = new Set(EQUIPMENT.map(e => e.id));
    saveEquipment(app.state.myEquipment);
    markSetupDone();
    showScreen('screenBrowse', app);
}

export function getFilteredWorkouts(app) {
    let filtered = app.state.activeFilter === 'All'
        ? WORKOUTS
        : WORKOUTS.filter(w => w.category === app.state.activeFilter);

    filtered = filtered.filter(w => w.equipment.every(e => app.state.myEquipment.has(e)));
    return filtered;
}
