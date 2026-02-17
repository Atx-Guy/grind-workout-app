# GitHub Copilot Instructions for Grind Workout App

## Project Overview

This is a Firebase-based workout application that helps users track and manage their fitness routines. The app features an AI-powered workout generator using DeepSeek AI that creates custom HIIT workouts based on equipment, duration, focus areas, and intensity levels.

## Commands

### Deployment
- **Deploy to Firebase Hosting**: Automatic deployment happens on merge to `main` branch via GitHub Actions
- **Local preview**: Open `index.html` in a web browser (no build step required)
- **Firebase CLI**: `firebase serve` (optional, requires Firebase CLI installed)

### Testing
- No automated test suite currently exists
- Manual testing: Open `index.html` in browser and test functionality
- Preview deployments: Automatically created for pull requests via GitHub Actions

### Linting
- No automated linting currently configured
- Follow HTML5 standards and existing code formatting patterns

## Testing Guidelines

- This is a single-page application with no automated test infrastructure
- All changes should be manually tested by:
  1. Opening `index.html` in a browser
  2. Testing authentication flows (login, signup, logout)
  3. Testing workout creation, editing, and deletion
  4. Testing the AI workout generator functionality
  5. Verifying UI responsiveness on different screen sizes
- When making changes, verify they don't break existing functionality
- For UI changes, take screenshots to document the impact

## Project Structure

```
grind-workout-app/
├── index.html              # Main single-page application (HTML, CSS, JavaScript)
├── firebase.json           # Firebase hosting configuration
├── .firebaserc             # Firebase project ID configuration
├── .github/
│   ├── copilot-instructions.md  # This file
│   ├── copilot-mcp.json         # MCP server configuration for Firebase tools
│   ├── SUPERPOWERS_INSTALL.md   # Instructions for Superpowers skills
│   └── workflows/               # GitHub Actions for Firebase deployment
├── README.md               # Project documentation
├── DEPLOYMENT.md           # Deployment notes and history
└── WORKOUT_GENERATOR.md    # AI workout generator documentation
```

### Key Files
- **index.html**: Contains all HTML, CSS (in `<style>` tags), and JavaScript (in `<script>` tags)
- **Firebase config**: Located within `index.html` in the Firebase initialization section
- **No build process**: This is a vanilla HTML/CSS/JS application with no transpilation or bundling

## Code Style

### HTML/CSS
- Use semantic HTML5 elements
- CSS is organized in the `<style>` tag with CSS custom properties (CSS variables) defined in `:root`
- BEM-like naming for complex components (e.g., `workout-card`, `exercise-block`)
- Responsive design using media queries (mobile-first approach)

### JavaScript
- Use modern ES6+ syntax (const/let, arrow functions, template literals)
- DOM manipulation using vanilla JavaScript (no frameworks)
- Firebase SDK v9+ modular syntax for Firebase operations
- Use async/await for asynchronous operations
- Follow existing naming conventions:
  - camelCase for variables and functions (e.g., `showScreen`, `userId`)
  - Descriptive function names that indicate action (e.g., `createWorkout`, `deleteExercise`)

### Code Examples
```javascript
// Good: Modern async/await with Firebase
async function saveWorkout(workoutData) {
    const user = auth.currentUser;
    if (!user) return;
    
    await addDoc(collection(db, 'workouts'), {
        ...workoutData,
        userId: user.uid,
        createdAt: serverTimestamp()
    });
}

// Good: Clear DOM manipulation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}
```

## Git Workflow

### Branching
- **Main branch**: `main` (protected, auto-deploys to production)
- **Feature branches**: Use descriptive names (e.g., `feature/workout-timer`, `fix/login-validation`)
- Copilot creates branches automatically following the pattern: `copilot/{issue-description}`

### Pull Requests
- All changes must go through pull requests
- PRs automatically trigger preview deployments to Firebase
- Copilot agent creates PRs automatically when working on issues
- Human review required before merging
- Merging to `main` triggers automatic production deployment

### Commit Messages
- Use clear, descriptive commit messages
- Start with a verb in present tense (e.g., "Add workout timer", "Fix login validation")
- Reference issue numbers when applicable

## Security & Boundaries

### What NOT to Modify
- **Firebase configuration**: Do not expose or change Firebase API keys and project configuration in `index.html`
- **GitHub Actions**: Do not modify `.github/workflows/` unless specifically working on CI/CD improvements
- **Firebase project settings**: Changes to `.firebaserc` or `firebase.json` should be minimal and intentional

### Security Guidelines
- Never commit secrets, API keys, or credentials to the repository
- Firebase configuration in `index.html` uses public API keys (this is safe for client-side Firebase apps)
- User authentication uses Firebase Auth - do not implement custom authentication
- Always validate user input before using it in database operations
- Use Firebase Security Rules to protect data (configured in Firebase Console)

### Data Privacy
- User data is stored in Firestore with user-specific access controls
- Do not log sensitive user information to console
- Respect user privacy in all data handling operations

## Firebase Integration

- **Project ID**: `grindapp-auth`
- **Authentication**: Firebase Authentication for user login/signup
- **Database**: Firestore for storing workouts, exercises, and user data
- **Hosting**: Firebase Hosting for production deployment
- **MCP Server**: Firebase tools are available via MCP server (configured in `copilot-mcp.json`)

### Database Structure
- Collections: `workouts`, `exercises`, `users`
- Documents include `userId` field for user-specific data access
- Timestamps use Firebase `serverTimestamp()` for consistency

## Superpowers Skills System

Before starting any significant work, check if a relevant skill applies from the superpowers library.
Skills location: ~/.github/copilot/superpowers/skills/

For installation instructions, see [SUPERPOWERS_INSTALL.md](SUPERPOWERS_INSTALL.md)

### Core Skills to Consider
- **using-superpowers**: Read first – explains how skills work
- **brainstorming**: Use before any creative work (features, components, modifications)
- **test-driven-development**: Use when implementing any feature or bugfix
- **systematic-debugging**: Use when encountering any bug or unexpected behavior
- **writing-plans**: Use when you have specs for multi-step tasks
- **verification-before-completion**: Use before claiming work is complete

When a skill might apply (even 1% chance), read the SKILL.md file and follow it. Skills are NOT optional. If a skill applies, use it.

## AI Workout Generator

The app includes an AI-powered workout generator using DeepSeek AI. See [WORKOUT_GENERATOR.md](../WORKOUT_GENERATOR.md) for detailed information about:
- Workout generation logic and prompts
- Block-based system structure
- Equipment and intensity handling
- Example prompts and outputs

When modifying the workout generator, maintain the existing prompt structure and block-based approach.
