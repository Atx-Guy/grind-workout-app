export function renderCompleteScreenHTML() {
    return `
        <div class="complete-screen">
            <div class="complete-icon">🔥</div>
            <div class="complete-title">WORKOUT COMPLETE</div>
            <div class="complete-stat" id="completeStat"></div>
            <button class="btn-start-workout" id="completeBackBtn" style="margin-top:20px;max-width:300px">BACK TO WORKOUTS</button>
        </div>
    `;
}
