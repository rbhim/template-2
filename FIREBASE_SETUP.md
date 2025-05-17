# Firebase Setup Instructions

This project uses Firebase for authentication, database (Firestore), and storage. Follow these steps to set up Firebase for this project:

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the steps to create a new project
3. Give your project a name (e.g., "Project Management App")
4. Enable Google Analytics if desired (optional)
5. Create the project

## 2. Add a Web App to Your Firebase Project

1. On the Firebase project dashboard, click the web icon (`</>`) to add a web app
2. Register the app with a nickname (e.g., "Project Management Web App")
3. Check the box for "Also set up Firebase Hosting" if you plan to deploy the app (optional)
4. Click "Register app"
5. Copy the Firebase configuration object shown in the code snippet

## 3. Set Up Environment Variables

1. Create a `.env.local` file in the root of your project
2. Add the following variables with values from your Firebase config:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## 4. Set Up Firestore Database

1. In the Firebase console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode" or "Start in test mode" (for development, you can use test mode)
4. Select a location for your database
5. Click "Enable"

## 5. Deploy Firestore Security Rules

1. In the Firebase console, go to "Firestore Database" > "Rules" tab
2. Copy the contents of the `firestore.rules` file from this project
3. Paste the rules into the rules editor
4. Click "Publish"

## 6. Set Up Authentication (Optional for this project)

1. In the Firebase console, go to "Authentication"
2. Click "Get started"
3. Enable desired sign-in providers (Google, Email/Password, etc.)
4. Follow the steps to configure each provider

## 7. Set Up Storage (Optional for this project)

1. In the Firebase console, go to "Storage"
2. Click "Get started"
3. Choose "Start in production mode" or "Start in test mode"
4. Click "Next"
5. Select a location for your storage
6. Click "Done"

## Testing the Integration

Once you've set up Firebase and configured your environment variables, you should be able to:

1. Run the application locally: `npm run dev`
2. The app should connect to Firebase and:
   - Seed the database with demo projects and team members if they don't exist
   - Display existing projects and team members from the database
   - Save any changes to projects and team members to the database

## Troubleshooting

If you encounter issues:

- Ensure your Firebase project is properly set up
- Verify your environment variables are correct
- Check the browser console for any Firebase-related errors
- Make sure your Firestore rules allow the necessary read/write operations 