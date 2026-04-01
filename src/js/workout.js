import { DEEPSEEK_URL, DEEPSEEK_KEY } from '../config.js';
import { showScreen } from './app.js';

const GEN_SUGGESTIONS = [
    '15 min Tabata core burner, no equipment',
    '20 min HIIT full body with bands',
    '30 min high intensity full body, bodyweight only',
    '15 min upper body push/pull with bands',
    '25 min lower body with short & long bands',
    '20 min chest and back with bands',
    '15 min HIIT arms — biceps & triceps',
    '20 min beginner friendly full body circuit',
    '18 min Tabata cardio with jump rope',
    '20 min endurance full body circuit',
];

export function openGenerator(app) {
    showScreen('screenGenerator', app);
}

export function renderGenChips(app) {
    const chipsContainer = document.getElementById('genChips');
    if (!chipsContainer) return;

    const shuffled = [...GEN_SUGGESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
    chipsContainer.innerHTML = shuffled.map(s =>
        `<button class="gen-chip" data-text="${s}">${s}</button>`
    ).join('');

    chipsContainer.querySelectorAll('.gen-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const genInput = document.getElementById('genInput');
            if (genInput) {
                genInput.value = chip.dataset.text;
                genInput.focus();
            }
        });
    });
}

export async function generateWorkout(app) {
    const input = document.getElementById('genInput')?.value.trim();
    if (!input) return;

    const output = document.getElementById('genOutput');
    const sendBtn = document.getElementById('genSendBtn');
    if (sendBtn) sendBtn.disabled = true;

    output.innerHTML = `<div class="gen-loading">
        <div class="gen-spinner"></div>
        <div class="gen-loading-text">Building your workout with <strong>DeepSeek AI</strong>...</div>
    </div>`;

    const equipList = [...app.state.myEquipment].length > 0 ? [...app.state.myEquipment].join(', ') : 'Bodyweight';

    const prompt = buildPrompt(input, equipList);

    try {
        const response = await fetch(DEEPSEEK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_KEY}`,
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: 'You are an Expert HIIT Programmer and Logic Engineer. You respond ONLY with valid JSON matching the block-based structure. No markdown, no backticks, no explanation.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 4096,
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API error ${response.status}: ${errText.substring(0, 200)}`);
        }

        const data = await response.json();
        const rawText = data.choices?.[0]?.message?.content;

        if (!rawText) throw new Error('Empty response from AI');

        let cleaned = rawText.trim();
        cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
        
        const blockWorkout = JSON.parse(cleaned);

        if (!blockWorkout.workout_title || !blockWorkout.structure) {
            throw new Error('AI returned an incomplete workout structure');
        }

        const workout = convertBlockToWorkout(blockWorkout, app);
        app.state.selectedWorkout = workout;
        showAiWorkout(app, workout);

    } catch (err) {
        console.error('AI generation error:', err);
        output.innerHTML = `<div class="gen-error">
            <strong>Couldn't generate workout</strong><br>
            ${err.message}<br>
            <button class="gen-retry-btn" id="retryBtn">Try Again</button>
        </div>`;
        
        const retryBtn = document.getElementById('retryBtn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => generateWorkout(app));
        }
    } finally {
        if (sendBtn) sendBtn.disabled = false;
    }
}

function buildPrompt(input, equipList) {
    return `You are an Expert HIIT Programmer and Logic Engineer. Generate a high-intensity circuit workout that fits a strict Block-Based structure for the GRIND mobile app.

USER'S AVAILABLE EQUIPMENT: ${equipList}
USER'S REQUEST: "${input}"

# CRITICAL LOGIC & CONSTRAINTS

1. **Time Management Logic:**
   - Calculate total duration STRICTLY: (Work Time + Rest Time) × Sets
   - Match user's requested duration exactly (allowing 1-2 min variance for transitions)
   - **Intensity-based timing:**
     * High Intensity: 40s Work / 20s Rest
     * Tabata: 20s Work / 10s Rest
     * Endurance: 60s Work / 30s Rest

2. **Block Structure Logic:**
   - **Warm-up (2-3 min):** Dynamic movements ONLY (e.g., Arm Circles, Jumping Jacks, High Knees)
   - **Blocks (1-3):** Pair exercises logically
   - **Cool-down (2-3 min):** Static stretching ONLY

3. **Equipment Filtering:**
   - STRICTLY use ONLY equipment from: ${equipList}
   - If NO equipment listed, use ONLY "Bodyweight" exercises
   - Valid equipment: Bodyweight, Long Band, Short Band, Pull-up Bar, Jump Rope

Respond with ONLY valid JSON (no markdown, no backticks, no explanation) in this exact format:
{
  "workout_title": "Catchy HIIT Workout Name",
  "total_duration": 20,
  "intensity_level": "High|Medium|Low",
  "structure": {
    "warmup": [
      { "exercise": "Jumping Jacks", "duration_seconds": 30 }
    ],
    "blocks": [
      {
        "block_name": "Block 1 — Push",
        "sets": 3,
        "exercises": [
          { "name": "Push-Ups", "duration_seconds": 40 },
          { "rest_seconds": 20 }
        ]
      }
    ],
    "cooldown": [
      { "exercise": "Standing Quad Stretch", "duration_seconds": 30 }
    ]
  }
}`;
}

function convertBlockToWorkout(blockWorkout, app) {
    const workout = {
        id: 'ai-' + Date.now(),
        title: blockWorkout.workout_title,
        category: 'HIIT',
        duration: blockWorkout.total_duration || 20,
        intensity: (blockWorkout.intensity_level || 'high').toLowerCase(),
        equipment: [...app.state.myEquipment],
        muscles: 'Full Body · AI Generated',
        desc: `${blockWorkout.intensity_level || 'High'} intensity ${blockWorkout.total_duration || 20} minute workout`,
        steps: []
    };

    if (blockWorkout.structure.warmup) {
        blockWorkout.structure.warmup.forEach(item => {
            workout.steps.push({
                phase: 'Warm-Up',
                name: item.exercise,
                duration: item.duration_seconds,
                type: 'exercise',
                tips: `${item.duration_seconds} seconds`
            });
        });
    }

    if (blockWorkout.structure.blocks) {
        blockWorkout.structure.blocks.forEach((block, blockIdx) => {
            const blockName = block.block_name || `Block ${blockIdx + 1}`;
            const sets = block.sets || 3;
            
            for (let setNum = 1; setNum <= sets; setNum++) {
                block.exercises.forEach(ex => {
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
                        if (ex.reps) {
                            step.reps = ex.reps;
                        } else if (ex.duration_seconds) {
                            step.tips = `${ex.duration_seconds} seconds`;
                        }
                        workout.steps.push(step);
                    }
                });
            }
        });
    }

    if (blockWorkout.structure.cooldown) {
        blockWorkout.structure.cooldown.forEach(item => {
            workout.steps.push({
                phase: 'Cool-Down',
                name: item.exercise,
                duration: item.duration_seconds,
                type: 'exercise',
                tips: `${item.duration_seconds} seconds`
            });
        });
    }

    return workout;
}

function showAiWorkout(app, workout) {
    const detailTitle = document.getElementById('detailTitle');
    const detailMeta = document.getElementById('detailMeta');
    const exerciseList = document.getElementById('exerciseList');

    if (detailTitle) detailTitle.textContent = '✨ ' + workout.title;

    const totalSec = workout.steps.reduce((s, e) => s + e.duration, 0);
    const exerciseCount = workout.steps.filter(s => s.type === 'exercise').length;
    if (detailMeta) {
        detailMeta.innerHTML = `
            <div class="detail-meta-item"><strong>${Math.round(totalSec / 60)}</strong> min</div>
            <div class="detail-meta-item"><strong>${exerciseCount}</strong> exercises</div>
            <div class="detail-meta-item"><strong>${workout.intensity || 'medium'}</strong></div>
            <div class="detail-meta-item" style="color:var(--accent-alt)">AI Generated</div>
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
