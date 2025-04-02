import { organizations as defaultOrganizations } from '../config/organizations.js';
import { adminDb } from '../firebase/admin.js';
import { doc, setDoc } from 'firebase/firestore';

const initializeFirestore = async () => {
  try {
    console.log('Starting Firestore initialization...');
    
    // Initialize each school in Firestore
    for (const [schoolId, schoolData] of Object.entries(defaultOrganizations.schools)) {
      console.log(`Initializing school: ${schoolData.name}`);
      
      // Create the school document
      await setDoc(doc(adminDb, 'organizations', schoolId), {
        ...schoolData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log(`Successfully initialized school: ${schoolData.name}`);
    }
    
    console.log('Firestore initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing Firestore:', error);
    throw error;
  }
};

// Run the initialization
initializeFirestore()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 