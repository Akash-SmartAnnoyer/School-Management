import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCw4sYQmQ-KTBcLD8eoTISEAWDtalE_3bs",
  authDomain: "school-management-c78c6.firebaseapp.com",
  projectId: "school-management-c78c6",
  storageBucket: "school-management-c78c6.firebasestorage.app",
  messagingSenderId: "556605101259",
  appId: "1:556605101259:web:183a77fe78e9e12223374e",
  measurementId: "G-PZQVFFZS90"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

// Initialize Analytics
export const analytics = getAnalytics(app);

export default app;

// Note: You need to set up CORS configuration in Firebase Console
// Go to Storage > Rules and add:
/*
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
*/

// Then in Firebase Console, go to Storage > Settings > CORS
// Add this configuration:
/*
[
  {
    "origin": ["http://localhost:3000"],
    "method": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "x-goog-resumable"]
  }
]
*/ 
