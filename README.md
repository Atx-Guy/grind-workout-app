# GRIND — Home Workout Engine 🔥

A powerful home workout application.

## Firebase Hosting Setup

This app is configured for deployment to Firebase Hosting via GitHub Actions.

### Initial Firebase Setup

To complete the Firebase hosting setup, follow these steps:

#### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter the project name: `grind` (or update `.firebaserc` with your chosen project ID)
4. Follow the setup wizard to complete project creation

#### 2. Set up Firebase Hosting

1. In the Firebase Console, navigate to your project
2. Go to **Build > Hosting** in the left sidebar
3. Click "Get started" and follow the setup wizard

#### 3. Generate Firebase Service Account Key

1. In the Firebase Console, go to **Project Settings** (gear icon)
2. Navigate to the **Service accounts** tab
3. Click "Generate new private key"
4. Download the JSON key file

#### 4. Add GitHub Secret

1. Go to your GitHub repository: https://github.com/redwinesuperuser/grind-workout-app
2. Navigate to **Settings > Secrets and variables > Actions**
3. Click "New repository secret"
4. Name: `FIREBASE_SERVICE_ACCOUNT_GRIND_WORKOUT_APP`
5. Value: Paste the entire contents of the downloaded JSON key file
6. Click "Add secret"

### Deployment

Once the setup is complete:

- **Production Deployment**: Any push to the `main` branch will automatically deploy to Firebase Hosting
- **Preview Deployments**: Pull requests will automatically generate preview URLs for testing

### Local Development

To test locally, simply open `index.html` in your browser.

### Firebase CLI (Optional)

For local testing with Firebase:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase serve
```

## Resources

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [GitHub Actions for Firebase](https://github.com/FirebaseExtended/action-hosting-deploy)
