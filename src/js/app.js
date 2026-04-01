import { EQUIPMENT, WORKOUTS, CIRCUMFERENCE, findWorkoutById, filterWorkouts } from './workout.js';
import * as storage from './storage.js';
import * as api from './api.js';

export const AppState = {
    activeFilter: 'All',
    selectedWorkout: null,
    currentIndex: 0,
    timeLeft: 0,
    isRunning: false,
    intervalId: null,
    soundEnabled: true,
    workoutStartTime: null,
    myEquipment: new Set(EQUIPMENT.map(e => e.id)),
    currentUser: null,
    isAuthenticated: false,
};

export function initializeApp() {
    const savedEquipment = storage.loadEquipment();
    if (savedEquipment) {
        AppState.myEquipment = savedEquipment;
    }

    const savedSound = storage.isSoundEnabled();
    AppState.soundEnabled = savedSound;

    const savedUser = storage.loadUser();
    if (savedUser) {
        AppState.currentUser = savedUser;
        AppState.isAuthenticated = true;
    }

    storage.saveEquipment(AppState.myEquipment);
}

export function toggleEquip(id, alwaysOn) {
    if (alwaysOn) return;
    if (AppState.myEquipment.has(id)) {
        AppState.myEquipment.delete(id);
    } else {
        AppState.myEquipment.add(id);
    }
    storage.saveEquipment(AppState.myEquipment);
    api.updateUserEquipment([...AppState.myEquipment]).catch(() => {});
}

export function setFilter(cat) {
    AppState.activeFilter = cat;
}

export function openDetail(id) {
    AppState.selectedWorkout = findWorkoutById(id);
}

export function startWorkout() {
    if (!AppState.selectedWorkout) return;
    AppState.currentIndex = 0;
    AppState.timeLeft = AppState.selectedWorkout.steps[0].duration;
    AppState.isRunning = false;
    AppState.workoutStartTime = Date.now();
    saveWorkoutState();
}

export function togglePlay() {
    if (AppState.isRunning) {
        clearInterval(AppState.intervalId);
        AppState.isRunning = false;
        speak('Paused');
    } else {
        AppState.isRunning = true;
        const current = AppState.selectedWorkout.steps[AppState.currentIndex];
        if (current.type !== 'rest') speak(current.name);
        AppState.intervalId = setInterval(tick, 1000);
    }
    saveWorkoutState();
}

function tick() {
    AppState.timeLeft--;
    if (AppState.timeLeft <= 3 && AppState.timeLeft > 0) {
        speak(String(AppState.timeLeft));
    }
    if (AppState.timeLeft <= 0) {
        advanceExercise();
    }
    saveWorkoutState();
}

function advanceExercise() {
    AppState.currentIndex++;
    if (AppState.currentIndex >= AppState.selectedWorkout.steps.length) {
        completeWorkout();
        return;
    }
    const next = AppState.selectedWorkout.steps[AppState.currentIndex];
    AppState.timeLeft = next.duration;

    if (next.type === 'rest') {
        speak('Rest');
    } else if (next.set) {
        speak(`${next.name}, Set ${next.set}`);
    } else {
        speak(next.name);
    }
    saveWorkoutState();
}

export function skipExercise() {
    advanceExercise();
}

export function stopWorkout() {
    clearInterval(AppState.intervalId);
    AppState.isRunning = false;
    storage.clearWorkoutState();
}

function completeWorkout() {
    clearInterval(AppState.intervalId);
    AppState.isRunning = false;
    const elapsed = Math.round((Date.now() - AppState.workoutStartTime) / 1000);
    
    speak('Workout complete. Great job!');

    api.saveWorkoutHistory(AppState.selectedWorkout.id, elapsed, new Date()).catch(() => {});

    storage.clearWorkoutState();
}

export function speak(text) {
    if (!AppState.soundEnabled || !('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.15;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
}

export function toggleSound() {
    AppState.soundEnabled = !AppState.soundEnabled;
    storage.setSoundEnabled(AppState.soundEnabled);
}

export function saveWorkoutState() {
    storage.saveWorkoutState({
        selectedWorkout: AppState.selectedWorkout,
        currentIndex: AppState.currentIndex,
        timeLeft: AppState.timeLeft,
        isRunning: AppState.isRunning,
        workoutStartTime: AppState.workoutStartTime
    });
}

export function restoreWorkoutState() {
    const state = storage.loadWorkoutState();
    if (!state || !state.selectedWorkout) {
        return false;
    }

    AppState.selectedWorkout = state.selectedWorkout;
    AppState.currentIndex = state.currentIndex;
    AppState.timeLeft = state.timeLeft;
    AppState.workoutStartTime = state.workoutStartTime;
    AppState.isRunning = false;

    speak('Workout restored');
    return true;
}

export function finishSetup() {
    AppState.myEquipment = new Set();
    document.querySelectorAll('#setupGrid .equip-toggle.active').forEach(el => {
        AppState.myEquipment.add(el.dataset.equip);
    });
    storage.saveEquipment(AppState.myEquipment);
    storage.markSetupDone();
    api.updateUserEquipment([...AppState.myEquipment]).catch(() => {});
}

export function skipSetup() {
    AppState.myEquipment = new Set(EQUIPMENT.map(e => e.id));
    storage.saveEquipment(AppState.myEquipment);
    storage.markSetupDone();
}

export async function handleLogin(email, password) {
    try {
        const response = await api.login(email, password);
        AppState.currentUser = response.user;
        AppState.isAuthenticated = true;
        storage.saveUser(response.user);
        storage.saveAuthToken(response.token);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function handleSignup(email, password) {
    try {
        const response = await api.register(email, password);
        AppState.currentUser = response.user;
        AppState.isAuthenticated = true;
        storage.saveUser(response.user);
        storage.saveAuthToken(response.token);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export function handleLogout() {
    AppState.currentUser = null;
    AppState.isAuthenticated = false;
    storage.clearUser();
}

export function skipLogin() {
    const restored = restoreWorkoutState();
    if (restored) {
        return { screen: 'timer', restored: true };
    }
    return { screen: storage.isSetupDone() ? 'browse' : 'setup', restored: false };
}

export async function generateWorkout(input) {
    const { DEEPSEEK_KEY, DEEPSEEK_URL } = await import('../config.js');
    
    const output = document.getElementById('genOutput');
    const sendBtn = document.getElementById('genSendBtn');
    sendBtn.disabled = true;

    output.innerHTML = `<div class="gen-loading">
        <div class="gen-spinner"></div>
        <div class="gen-loading-text">Building your workout with <strong>DeepSeek AI</strong>...</div>
    </div>`;

    const equipList = [...AppState.myEquipment].length > 0 ? [...AppState.myEquipment].join(', ') : 'Bodyweight';

    const prompt = `You are an Expert HIIT Programmer. Generate a high-intensity circuit workout.

USER'S AVAILABLE EQUIPMENT: ${equipList}
USER'S REQUEST: "${input}"

Respond with ONLY valid JSON in this format:
{
  "workout_title": "Workout Name",
  "total_duration": 20,
  "intensity_level": "High",
  "structure": {
    "warmup": [{ "exercise": "Name", "duration_seconds": 30 }],
    "blocks": [{
      "block_name": "Block 1",
      "sets": 3,
      "exercises": [
        { "name": "Push-Ups", "duration_seconds": 40 },
        { "rest_seconds": 20 }
      ]
    }],
    "cooldown": [{ "exercise": "Stretch", "duration_seconds": 30 }]
  }
}`;

    try {
        const resp = await fetch(DEEPSEEK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_KEY}`,
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: 'You respond ONLY with valid JSON.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 4096,
            })
        });

        if (!resp.ok) throw new Error(`API error ${resp.status}`);

        const data = await resp.json();
        const rawText = data.choices?.[0]?.message?.content;
        if (!rawText) throw new Error('Empty response');

        let cleaned = rawText.trim();
        cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
        
        const blockWorkout = JSON.parse(cleaned);

        const workout = {
            id: 'ai-' + Date.now(),
            title: blockWorkout.workout_title,
            category: 'HIIT',
            duration: blockWorkout.total_duration || 20,
            intensity: (blockWorkout.intensity_level || 'high').toLowerCase(),
            equipment: [...AppState.myEquipment],
            muscles: 'Full Body · AI Generated',
            desc: `${blockWorkout.intensity_level || 'High'} intensity workout`,
            steps: []
        };

        blockWorkout.structure.warmup?.forEach(item => {
            workout.steps.push({
                phase: 'Warm-Up',
                name: item.exercise,
                duration: item.duration_seconds,
                type: 'exercise',
                tips: `${item.duration_seconds} seconds`
            });
        });

        blockWorkout.structure.blocks?.forEach((block, blockIdx) => {
            const blockName = block.block_name || `Block ${blockIdx + 1}`;
            const sets = block.sets || 3;
            
            for (let setNum = 1; setNum <= sets; setNum++) {
                block.exercises?.forEach(ex => {
                    if (ex.rest_seconds !== undefined) {
                        workout.steps.push({
                            phase: blockName,
                            name: 'Rest',
                            duration: ex.rest_seconds,
                            type: 'rest'
                        });
                    } else if (ex.name) {
                        const step = {
                            phase: blockName,
                            name: ex.name,
                            duration: ex.duration_seconds || 40,
                            type: 'exercise',
                            set: setNum
                        };
                        if (ex.reps) step.reps = ex.reps;
                        else if (ex.duration_seconds) step.tips = `${ex.duration_seconds} seconds`;
                        workout.steps.push(step);
                    }
                });
            }
        });

        blockWorkout.structure.cooldown?.forEach(item => {
            workout.steps.push({
                phase: 'Cool-Down',
                name: item.exercise,
                duration: item.duration_seconds,
                type: 'exercise',
                tips: `${item.duration_seconds} seconds`
            });
        });

        AppState.selectedWorkout = workout;
        return { success: true, workout };

    } catch (err) {
        return { success: false, error: err.message };
    } finally {
        sendBtn.disabled = false;
    }
}

export function getFilteredWorkouts() {
    return filterWorkouts(AppState.activeFilter, AppState.myEquipment);
}
