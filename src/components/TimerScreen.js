import { CIRCUMFERENCE } from '../js/workout.js';

export function renderTimerScreen(container) {
    container.innerHTML = `
        <div class="screen" id="screenTimer">
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
                    <button class="timer-btn btn-stop" id="btnStop">QUIT</button>
                    <button class="timer-btn btn-play" id="btnPlay">PLAY</button>
                    <button class="timer-btn btn-skip" id="btnSkip">SKIP →</button>
                </div>
            </div>
        </div>
    `;

    return {
        ringFg: container.querySelector('#timerRingFg'),
        phaseEl: container.querySelector('#timerPhase'),
        timeEl: container.querySelector('#timerTime'),
        setEl: container.querySelector('#timerSet'),
        exNameEl: container.querySelector('#timerExName'),
        exInfoEl: container.querySelector('#timerExInfo'),
        progressFill: container.querySelector('#timerProgressFill'),
        progressText: container.querySelector('#timerProgressText'),
        nextUp: container.querySelector('#timerNextUp'),
        nextName: container.querySelector('#timerNextName'),
        btnPlay: container.querySelector('#btnPlay'),
        btnStop: container.querySelector('#btnStop'),
        btnSkip: container.querySelector('#btnSkip'),
    };
}
