import { togglePlay, skipExercise, stopWorkout } from '../js/app.js';

export function renderTimerScreenHTML() {
    return `
        <div class="timer-container">
            <div class="timer-ring-wrapper">
                <svg class="timer-ring" viewBox="0 0 120 120">
                    <circle class="timer-ring-bg" cx="60" cy="60" r="54"/>
                    <circle class="timer-ring-fg" id="timerRingFg" cx="60" cy="60" r="54"
                        stroke-dasharray="339.292" stroke-dashoffset="0"/>
                </svg>
                <div class="timer-center">
                    <div class="timer-phase" id="timerPhase">WARM-UP</div>
                    <div class="timer-time" id="timerTime">0:30</div>
                    <div class="timer-set" id="timerSet"></div>
                </div>
            </div>

            <div class="timer-exercise-name" id="timerExName">Arm Circles</div>
            <div class="timer-exercise-info" id="timerExInfo">Get ready</div>

            <div class="timer-progress-bar"><div class="timer-progress-fill" id="timerProgressFill"></div></div>
            <div class="timer-progress-text" id="timerProgressText">0% Complete</div>

            <div class="timer-next-up" id="timerNextUp">
                <div>
                    <div class="timer-next-label">NEXT UP</div>
                    <div class="timer-next-name" id="timerNextName"></div>
                </div>
            </div>

            <div class="timer-controls">
                <button class="timer-btn btn-stop" id="stopWorkoutBtn">QUIT</button>
                <button class="timer-btn btn-play" id="btnPlay">PLAY</button>
                <button class="timer-btn btn-skip" id="skipExerciseBtn">SKIP →</button>
            </div>
        </div>
    `;
}

export function setupTimerEventListeners(app) {
    const btnPlay = document.getElementById('btnPlay');
    if (btnPlay) {
        btnPlay.addEventListener('click', () => togglePlay(app));
    }

    const skipBtn = document.getElementById('skipExerciseBtn');
    if (skipBtn) {
        skipBtn.addEventListener('click', () => skipExercise(app));
    }

    const stopBtn = document.getElementById('stopWorkoutBtn');
    if (stopBtn) {
        stopBtn.addEventListener('click', () => stopWorkout(app));
    }
}
