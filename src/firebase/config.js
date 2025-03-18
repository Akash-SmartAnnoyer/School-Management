import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "YOUR_API_KEY",
  authDomain: "school-management-c78c6.firebaseapp.com",
  projectId: "school-management-c78c6",
  storageBucket: "school-management-c78c6.appspot.com",
  messagingSenderId: "556605101259",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); 