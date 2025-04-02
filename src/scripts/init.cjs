const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

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
const db = getFirestore(app);

const defaultOrganizations = {
  schools: {
    'usha-vidyalayam': {
      id: 'usha-vidyalayam',
      name: 'Usha Vidyalayam',
      address: 'School Address',
      phone: 'School Phone',
      email: 'school@email.com',
      logo: 'https://via.placeholder.com/150',
      principal: {
        username: 'usha_principal',
        password: 'admin123',
        name: 'Dr. Principal Name',
        email: 'principal@ushavidyalayam.com',
        profilePic: 'https://via.placeholder.com/150'
      },
      teachers: []
    },
    'guru-nanak': {
      id: 'guru-nanak',
      name: 'Guru Nanak Public School',
      address: 'School Address',
      phone: 'School Phone',
      email: 'school@email.com',
      logo: 'https://via.placeholder.com/150',
      principal: {
        username: 'guru_principal',
        password: 'admin123',
        name: 'Dr. Principal Name',
        email: 'principal@gurunanak.com',
        profilePic: 'https://via.placeholder.com/150'
      },
      teachers: []
    },
    'dav-public': {
      id: 'dav-public',
      name: 'DAV Public School',
      address: 'School Address',
      phone: 'School Phone',
      email: 'school@email.com',
      logo: 'https://via.placeholder.com/150',
      principal: {
        username: 'dav_principal',
        password: 'admin123',
        name: 'Dr. Principal Name',
        email: 'principal@davpublic.com',
        profilePic: 'https://via.placeholder.com/150'
      },
      teachers: []
    }
  }
};

async function initializeFirestore() {
  try {
    console.log('Starting Firestore initialization...');
    
    for (const [schoolId, schoolData] of Object.entries(defaultOrganizations.schools)) {
      console.log(`Initializing school: ${schoolData.name}`);
      
      await setDoc(doc(db, 'organizations', schoolId), {
        ...schoolData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log(`Successfully initialized school: ${schoolData.name}`);
    }
    
    console.log('Firestore initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing Firestore:', error);
    process.exit(1);
  }
}

initializeFirestore(); 