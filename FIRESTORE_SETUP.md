# Firestore Database Setup

This guide explains how to deploy the Firestore security rules and verify your database is configured correctly.

## Overview

The app now includes:
- ✅ Firestore security rules (`firestore.rules`) that allow authenticated users to access their own data
- ✅ Firebase configuration (`firebase.json`) updated to include Firestore rules
- ✅ Workout history tracking and viewing functionality
- ✅ UI to view past workouts

## Deploying Security Rules

The Firestore security rules **must be deployed** to Firebase before users can save and view their workout history.

### Option 1: Deploy via Firebase CLI (Recommended)

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy only the Firestore rules
firebase deploy --only firestore:rules
```

### Option 2: Deploy via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `grindapp-auth`
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules` into the rules editor
5. Click **Publish**

## Security Rules Explanation

The current rules allow:
- ✅ Authenticated users can read/write their own user document (`/users/{userId}`)
- ✅ Authenticated users can read/write their own workout history (`/users/{userId}/history/{historyId}`)
- ❌ All other access is denied

This ensures:
- Users can only access their own data
- Unauthenticated users cannot access any data
- Workout history is private to each user

## Verifying the Setup

After deploying the rules:

1. Open the app and sign in
2. Complete a workout
3. Click the **History** button in the header
4. You should see your completed workout in the history list

## Database Structure

```
/users/{userId}
  - email: string
  - createdAt: timestamp
  - setupDone: boolean
  - equipment: array
  - lastUpdated: timestamp
  
  /history/{historyId}
    - workoutId: string
    - duration: number (seconds)
    - completedAt: timestamp
```

## Troubleshooting

### "Permission denied" errors
- Make sure you've deployed the security rules
- Verify you're signed in to the app
- Check that the rules allow access to `users/{userId}/history`

### History not showing
- Make sure you've completed at least one workout
- Check the browser console for any errors
- Verify Firestore is enabled in Firebase Console

### Rules not updating
- After editing `firestore.rules`, you must redeploy with `firebase deploy --only firestore:rules`
- Changes in the Firebase Console are immediate

## Next Steps

Consider enhancing the database:
- Add workout statistics and analytics
- Add workout templates for reuse
- Add sharing capabilities
- Add workout goals and progress tracking
