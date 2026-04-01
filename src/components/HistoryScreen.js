export function renderHistoryScreenHTML() {
    return `
        <div class="history-header">
            <div class="history-title">WORKOUT HISTORY</div>
            <div class="history-subtitle">Your completed workouts</div>
        </div>
        <div class="history-list" id="historyList">
            <div class="history-loading">Loading history...</div>
        </div>
    `;
}
