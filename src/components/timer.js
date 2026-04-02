import { formatTime } from '../ui.js';
import { storage } from '../storage.js';

export class WorkoutTimer {
  constructor(workout, onComplete, onQuit) {
    this.workout = workout;
    this.steps = workout.steps;
    this.currentIndex = 0;
    this.timeRemaining = this.steps[0].duration;
    this.isRunning = false;
    this.isPaused = false;
    this.startTime = Date.now();
    this.totalElapsed = 0;
    this.onComplete = onComplete;
    this.onQuit = onQuit;
    this.interval = null;
    
    this.circumference = 2 * Math.PI * 54;
  }
  
  start(container) {
    this.render(container);
    this.startTimer();
  }
  
  render(container) {
    const current = this.steps[this.currentIndex];
    const progress = 1 - (this.timeRemaining / current.duration);
    const offset = this.circumference * progress;
    
    container.innerHTML = `
      <div class="screen" id="screenTimer">
        <div class="timer-container">
          <div class="timer-ring-wrapper">
            <svg class="timer-ring" viewBox="0 0 120 120">
              <circle class="timer-ring-bg" cx="60" cy="60" r="54"/>
              <circle class="timer-ring-fg ${current.type === 'rest' ? 'rest' : ''}" 
                id="timerRingFg" cx="60" cy="60" r="54"
                stroke-dasharray="${this.circumference}" 
                stroke-dashoffset="${offset}"/>
            </svg>
            <div class="timer-center">
              <div class="timer-phase" id="timerPhase">${current.phase || 'WORKOUT'}</div>
              <div class="timer-time" id="timerTime">${formatTime(this.timeRemaining)}</div>
              <div class="timer-set" id="timerSet"></div>
            </div>
          </div>
          
          <div class="timer-exercise-name" id="timerExName">${current.name}</div>
          <div class="timer-exercise-info" id="timerExInfo">
            ${current.type === 'rest' ? 'Take a breather' : (current.reps ? `${current.reps} reps` : current.tips || '')}
          </div>
          
          <div class="timer-progress-bar">
            <div class="timer-progress-fill" id="timerProgressFill"></div>
          </div>
          <div class="timer-progress-text" id="timerProgressText">0% Complete</div>
          
          <div class="timer-next-up" id="timerNextUp">
            <div>
              <div class="timer-next-label">NEXT UP</div>
              <div class="timer-next-name" id="timerNextName">${this.getNextExercise()}</div>
            </div>
          </div>
          
          <div class="timer-controls">
            <button class="timer-btn btn-stop" id="btnQuit">QUIT</button>
            <button class="timer-btn btn-play" id="btnPlay">PLAY</button>
            <button class="timer-btn btn-skip" id="btnSkip">SKIP →</button>
          </div>
        </div>
      </div>
    `;
    
    this.bindEvents();
    this.updateProgress();
  }
  
  bindEvents() {
    document.getElementById('btnQuit')?.addEventListener('click', () => {
      this.stop();
      this.onQuit();
    });
    
    document.getElementById('btnPlay')?.addEventListener('click', () => {
      if (this.isPaused) {
        this.resume();
      } else if (!this.isRunning) {
        this.startTimer();
      } else {
        this.pause();
      }
    });
    
    document.getElementById('btnSkip')?.addEventListener('click', () => {
      this.nextStep();
    });
  }
  
  startTimer() {
    this.isRunning = true;
    this.isPaused = false;
    document.getElementById('btnPlay').textContent = 'PAUSE';
    document.getElementById('btnPlay').className = 'timer-btn btn-pause';
    
    this.interval = setInterval(() => {
      this.tick();
    }, 1000);
  }
  
  pause() {
    this.isPaused = true;
    this.isRunning = false;
    clearInterval(this.interval);
    document.getElementById('btnPlay').textContent = 'PLAY';
    document.getElementById('btnPlay').className = 'timer-btn btn-play';
  }
  
  resume() {
    this.startTimer();
  }
  
  stop() {
    this.isRunning = false;
    this.isPaused = false;
    clearInterval(this.interval);
  }
  
  tick() {
    this.timeRemaining--;
    this.totalElapsed++;
    
    if (this.timeRemaining <= 0) {
      this.nextStep();
    } else {
      this.updateDisplay();
    }
  }
  
  nextStep() {
    this.currentIndex++;
    if (this.currentIndex >= this.steps.length) {
      this.complete();
      return;
    }
    this.timeRemaining = this.steps[this.currentIndex].duration;
    this.updateDisplay();
    this.render(document.querySelector('.app-shell'));
    if (this.isRunning) {
      this.startTimer();
    }
  }
  
  updateDisplay() {
    const current = this.steps[this.currentIndex];
    const timeEl = document.getElementById('timerTime');
    const phaseEl = document.getElementById('timerPhase');
    const infoEl = document.getElementById('timerExInfo');
    const ringFg = document.getElementById('timerRingFg');
    
    if (timeEl) timeEl.textContent = formatTime(this.timeRemaining);
    if (phaseEl) phaseEl.textContent = current.phase || 'WORKOUT';
    if (infoEl) {
      infoEl.textContent = current.type === 'rest' 
        ? 'Take a breather' 
        : (current.reps ? `${current.reps} reps` : current.tips || '');
    }
    
    const progress = 1 - (this.timeRemaining / current.duration);
    const offset = this.circumference * (1 - progress);
    if (ringFg) {
      ringFg.style.strokeDashoffset = offset;
      ringFg.className = `timer-ring-fg ${current.type === 'rest' ? 'rest' : ''}`;
    }
    
    this.updateProgress();
    
    const nextName = document.getElementById('timerNextName');
    if (nextName) nextName.textContent = this.getNextExercise();
  }
  
  updateProgress() {
    const totalTime = this.steps.reduce((sum, s) => sum + s.duration, 0);
    const elapsed = this.steps.slice(0, this.currentIndex).reduce((sum, s) => sum + s.duration, 0);
    const currentElapsed = this.steps[this.currentIndex].duration - this.timeRemaining;
    const overallProgress = ((elapsed + currentElapsed) / totalTime) * 100;
    
    const fill = document.getElementById('timerProgressFill');
    const text = document.getElementById('timerProgressText');
    if (fill) fill.style.width = `${overallProgress}%`;
    if (text) text.textContent = `${Math.round(overallProgress)}% Complete`;
  }
  
  getNextExercise() {
    if (this.currentIndex + 1 < this.steps.length) {
      const next = this.steps[this.currentIndex + 1];
      return next.type === 'rest' ? 'Rest' : next.name;
    }
    return 'Finish!';
  }
  
  complete() {
    this.stop();
    storage.set('last_workout', {
      ...this.workout,
      completedAt: Date.now(),
      totalTime: Math.round(this.totalElapsed / 60),
      exercisesCompleted: this.currentIndex
    });
    this.onComplete({
      ...this.workout,
      totalTime: Math.round(this.totalElapsed / 60),
      exercisesCompleted: this.currentIndex
    });
  }
}
