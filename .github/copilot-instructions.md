# GitHub Copilot Instructions for Grind Workout App

## Project Overview

This is a Firebase-based workout application that helps users track and manage their fitness routines. The app features AI-powered workout generation using DeepSeek AI.

**Tech Stack:**
- Frontend: Vanilla JavaScript, HTML5, CSS3
- Backend: Firebase (Authentication, Firestore, Hosting)
- AI Integration: DeepSeek AI for workout generation
- Deployment: GitHub Actions → Firebase Hosting
- Project ID: `grindapp-auth`

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

## Project Structure

```
/
├── index.html              # Main application (single-page app)
├── firebase.json           # Firebase hosting configuration
├── .firebaserc            # Firebase project configuration
├── .github/
│   ├── workflows/         # GitHub Actions for CI/CD
│   └── copilot-mcp.json  # MCP server configuration
├── README.md              # Project documentation
├── DEPLOYMENT.md          # Deployment guide
└── WORKOUT_GENERATOR.md   # AI workout generator docs
```

## Coding Standards

### JavaScript Style
- Use modern ES6+ syntax
- Prefer `const` over `let`; avoid `var`
- Use template literals for string interpolation
- Use arrow functions for callbacks
- Follow existing naming conventions in the codebase

### Firebase Integration
- All Firebase operations are in `index.html`
- Use Firebase Auth for user authentication
- Store workout data in Firestore collections
- Handle authentication state changes properly
- Always check user authentication before database operations

### AI Workout Generator
- Follow the Block-Based System (warm-up, blocks, cool-down)
- Validate user input before API calls
- Handle API errors gracefully with user feedback
- Respect the workout structure defined in WORKOUT_GENERATOR.md

### UI/UX Conventions
- Back button visibility is controlled by `showScreen()` function
- Hide back button on: `screenBrowse`, `screenSetup`, `screenLogin`
- Maintain consistent screen transition patterns
- Provide user feedback for all async operations

## Testing and Validation

### Manual Testing
- Open `index.html` in a browser for local testing
- Test Firebase features using the live Firebase project
- Verify authentication flows work correctly
- Test workout generation with various prompts

### Code Review
- Review all Firebase security implications
- Verify no secrets or API keys are committed
- Check that user data is properly validated
- Ensure error handling is comprehensive

## Security Guidelines

### Critical Rules
- **NEVER** commit API keys, secrets, or credentials to the repository
- **NEVER** expose Firebase service account keys
- **ALWAYS** validate user input before processing
- **ALWAYS** check authentication before database operations
- **NEVER** trust client-side data for authorization decisions

### Firebase Security
- Use Firebase Security Rules for database access control
- Implement proper authentication checks
- Sanitize user inputs before storing in Firestore
- Use environment variables for sensitive configuration

## Deployment

### Automated Deployment
- Main branch pushes automatically deploy to production
- Pull requests generate preview deployments
- GitHub Actions handles all deployment steps
- Firebase Hosting serves the application

### Pre-Deployment Checklist
- Test locally by opening `index.html`
- Verify Firebase integration works
- Check for console errors
- Validate all features work as expected

## Common Tasks

### Adding a New Feature
1. Use the `brainstorming` skill to plan the feature
2. Follow the `test-driven-development` skill if applicable
3. Update documentation if the feature changes user-facing behavior
4. Test thoroughly before creating PR

### Fixing a Bug
1. Use the `systematic-debugging` skill
2. Identify the root cause before making changes
3. Make minimal changes to fix the issue
4. Verify the fix doesn't break existing functionality

### Modifying Firebase Integration
1. Review Firebase documentation for best practices
2. Test with Firebase emulator if possible
3. Verify security rules are still appropriate
4. Update Firestore indexes if needed

## Boundaries and Limitations

### What to Modify
✅ UI/UX improvements in `index.html`
✅ Firebase integration enhancements
✅ Workout generation logic
✅ Documentation updates
✅ Bug fixes and refactoring

### What NOT to Modify Without Approval
❌ Firebase project configuration (`.firebaserc`)
❌ GitHub Actions workflows (unless fixing a bug)
❌ Security-critical authentication logic
❌ Database schema changes (coordinate with team)

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Hosting Guide](https://firebase.google.com/docs/hosting)
- [GitHub Actions for Firebase](https://github.com/FirebaseExtended/action-hosting-deploy)
- [DeepSeek AI Documentation](https://platform.deepseek.com/docs)

## Getting Help

- For Firebase issues: Check Firebase Console and logs
- For deployment issues: Review GitHub Actions workflow runs
- For AI generation issues: Review WORKOUT_GENERATOR.md
- For general questions: Refer to README.md and project documentation
