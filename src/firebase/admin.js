import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCw4sYQmQ-KTBcLD8eoTISEAWDtalE_3bs",
  authDomain: "school-management-c78c6.firebaseapp.com",
  projectId: "school-management-c78c6",
  storageBucket: "school-management-c78c6.firebasestorage.app",
  messagingSenderId: "556605101259",
  appId: "1:556605101259:web:183a77fe78e9e12223374e",
  measurementId: "G-PZQVFFZS90"
};

// Initialize Firebase without analytics
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const adminDb = getFirestore(app); 