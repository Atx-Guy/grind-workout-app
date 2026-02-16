# AI Workout Generator - Technical Documentation

## Overview
The GRIND app includes an AI-powered workout generator that creates personalized HIIT workouts using DeepSeek AI. The generator follows a strict block-based system designed to maximize effectiveness and safety.

## Architecture

### Input Processing
- **User Request**: Natural language input (e.g., "20 min HIIT full body with bands")
- **Equipment Context**: User's available equipment from their profile
- **AI Engine**: DeepSeek Chat model with custom prompting

### Output Structure

#### Block-Based JSON Format
The AI generates workouts in a structured format:

```json
{
  "workout_title": "Catchy HIIT Workout Name",
  "total_duration": 20,
  "intensity_level": "High|Medium|Low",
  "structure": {
    "warmup": [
      { "exercise": "Exercise Name", "duration_seconds": 30 }
    ],
    "blocks": [
      {
        "block_name": "Block 1 — Description",
        "sets": 3,
        "exercises": [
          { "name": "Exercise", "duration_seconds": 40 },
          { "rest_seconds": 20 }
        ]
      }
    ],
    "cooldown": [
      { "exercise": "Stretch Name", "duration_seconds": 30 }
    ]
  }
}
```

## Core Logic & Constraints

### 1. Time Management Logic
Ensures accurate workout duration:
- **Calculation**: `(Work Time + Rest Time) × Sets`
- **Variance**: Allows 1-2 minutes for transitions
- **Intensity-based Timing**:
  - High Intensity: 40s Work / 20s Rest
  - Tabata: 20s Work / 10s Rest
  - Endurance: 60s Work / 30s Rest

Example calculation for 20-minute workout:
- 2 blocks, 3 sets each, 2 exercises per block
- Per cycle: (40s + 20s + 40s + 30s) = 130s
- Per block: 130s × 3 sets = 390s (6.5 min)
- Two blocks: 780s (13 min)
- Add warmup (2 min) + cooldown (2 min) = 17 min
- Adjust sets or add third block to reach 20 min

### 2. Block Structure Logic

#### Warm-up (2-3 minutes)
- **Purpose**: Prepare body for high intensity
- **Type**: Dynamic movements only
- **Examples**: Jumping Jacks, Arm Circles, High Knees, Leg Swings

#### Blocks (1-3 blocks)
Exercises are paired using two main strategies:

**Logic A - Peripheral Heart Action (PHA)**
- Alternates upper body and lower body exercises
- Keeps heart rate elevated
- Examples: Push-ups → Squats, Band Press → Lunges

**Logic B - Agonist/Antagonist**
- Pairs opposing muscle groups
- Allows active recovery
- Examples: Push (Push-ups) → Pull (Band Rows)

#### Cool-down (2-3 minutes)
- **Purpose**: Gradual recovery and flexibility
- **Type**: Static stretching only
- **Examples**: Quad Stretch, Deep Breathing, Hamstring Stretch

### 3. Equipment Filtering
Strict adherence to user's available equipment:
- **Valid Equipment**: Bodyweight, Long Band, Short Band, Pull-up Bar, Jump Rope
- **Fallback**: If no equipment selected, defaults to Bodyweight only
- **Validation**: AI is instructed to ONLY use available equipment

### 4. Exercise Format
Each exercise can specify:
- **Duration-based**: `{ "name": "Plank", "duration_seconds": 45 }`
- **Rep-based**: `{ "name": "Squats", "reps": 15 }` or `{ "name": "Lunges", "reps": "12 each" }`
- **Rest periods**: `{ "rest_seconds": 20 }`

## Data Flow

### 1. User Input → AI Prompt
```javascript
const prompt = `You are an Expert HIIT Programmer...
USER'S AVAILABLE EQUIPMENT: ${equipList}
USER'S REQUEST: "${input}"
...`
```

### 2. AI Response → Block Format
DeepSeek AI returns structured JSON matching the block-based format.

### 3. Block Format → Step Format
The app converts the block-based format to step-based format for UI compatibility:

```javascript
// Block format (from AI)
{
  "block_name": "Block 1",
  "sets": 3,
  "exercises": [
    { "name": "Push-Ups", "duration_seconds": 40 },
    { "rest_seconds": 20 }
  ]
}

// Converts to step format (for UI)
[
  { phase: "Block 1", name: "Push-Ups", set: 1, duration: 40, type: "exercise" },
  { phase: "Block 1", name: "Rest", duration: 20, type: "rest" },
  { phase: "Block 1", name: "Push-Ups", set: 2, duration: 40, type: "exercise" },
  { phase: "Block 1", name: "Rest", duration: 20, type: "rest" },
  { phase: "Block 1", name: "Push-Ups", set: 3, duration: 40, type: "exercise" },
  { phase: "Block 1", name: "Rest", duration: 20, type: "rest" }
]
```

### 4. Step Format → UI Rendering
The existing workout player uses the step-based format for:
- Exercise list display
- Workout timer
- Progress tracking
- Completion metrics

## Error Handling

### Validation
- Checks for required fields: `workout_title`, `structure`, `warmup`, `blocks`, `cooldown`
- Validates array structures
- Falls back to error message if AI response is invalid

### User Feedback
- Loading state: "Building your workout with DeepSeek AI..."
- Error state: Shows error message with retry button
- Success state: Immediately displays workout in detail view

## Example Prompts

### Effective Prompts
✅ "20 min HIIT full body with bands"
✅ "15 min Tabata core burner, no equipment"
✅ "30 min high intensity full body, bodyweight only"
✅ "25 min upper body push/pull with long band"

### Tips for Best Results
- Specify duration (15, 20, 30 minutes)
- Mention intensity level (HIIT, Tabata, endurance)
- Include body focus (full body, upper, lower, core)
- List specific equipment if needed

## Future Enhancements

### Potential Improvements
1. **Workout History Integration**: Save AI-generated workouts to user's library
2. **Progressive Overload**: Track performance and adjust difficulty
3. **Workout Variations**: Generate variations of successful workouts
4. **Multi-language Support**: Generate workouts in different languages
5. **Video Demonstrations**: Link exercises to demonstration videos
6. **Nutrition Integration**: Suggest pre/post-workout nutrition

## Technical Notes

### Dependencies
- DeepSeek Chat API (requires API key)
- JavaScript ES6+ (async/await, arrow functions)
- No external libraries required

### Performance
- API call typically completes in 2-5 seconds
- Response size: ~2-4KB for typical workout
- Rate limiting: Managed by DeepSeek API

### Security
- API key is client-side (acceptable for this use case)
- No user data sent to API beyond equipment list and request
- Input sanitization handled by JSON parsing
