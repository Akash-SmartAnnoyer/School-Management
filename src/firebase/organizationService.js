import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

const ORGANIZATIONS_COLLECTION = 'organizations';

export const getOrganizations = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, ORGANIZATIONS_COLLECTION));
    const organizations = {};
    querySnapshot.forEach((doc) => {
      organizations[doc.id] = doc.data();
    });
    return organizations;
  } catch (error) {
    console.error('Error getting organizations:', error);
    throw error;
  }
};

export const getSchoolById = async (schoolId) => {
  try {
    const docRef = doc(db, ORGANIZATIONS_COLLECTION, schoolId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error('Error getting school:', error);
    throw error;
  }
};

export const updateSchool = async (schoolId, schoolData) => {
  try {
    const schoolRef = doc(db, ORGANIZATIONS_COLLECTION, schoolId);
    
    // First get the current school data
    const schoolDoc = await getDoc(schoolRef);
    if (!schoolDoc.exists()) {
      throw new Error('School not found');
    }
    
    // Create an update object with only the fields that are provided
    const updateData = {};
    
    // Only include fields that are defined in schoolData
    Object.keys(schoolData).forEach(key => {
      if (schoolData[key] !== undefined) {
        updateData[key] = schoolData[key];
      }
    });

    // Add timestamp
    updateData.updatedAt = serverTimestamp();

    // Only proceed with update if there are fields to update
    if (Object.keys(updateData).length > 0) {
      await updateDoc(schoolRef, updateData);
    }

    return await getSchoolById(schoolId);
  } catch (error) {
    console.error('Error updating school:', error);
    throw error;
  }
};

export const updatePrincipal = async (schoolId, principalData) => {
  try {
    const schoolRef = doc(db, ORGANIZATIONS_COLLECTION, schoolId);
    
    // First get the current school data
    const schoolDoc = await getDoc(schoolRef);
    if (!schoolDoc.exists()) {
      throw new Error('School not found');
    }
    
    const currentData = schoolDoc.data();
    const currentPrincipal = currentData.principal || {};
    
    // Create an update object with only the fields that are provided
    const updateData = {
      principal: {
        ...currentPrincipal,
        ...principalData
      }
    };

    // Remove any undefined values from the principal object
    Object.keys(updateData.principal).forEach(key => {
      if (updateData.principal[key] === undefined) {
        delete updateData.principal[key];
      }
    });

    // Add timestamp
    updateData.updatedAt = serverTimestamp();

    await updateDoc(schoolRef, updateData);
    return await getSchoolById(schoolId);
  } catch (error) {
    console.error('Error updating principal:', error);
    throw error;
  }
};

export const updateTeacher = async (schoolId, username, teacherData) => {
  try {
    const school = await getSchoolById(schoolId);
    if (!school) throw new Error('School not found');

    const teachers = school.teachers || [];
    const teacherIndex = teachers.findIndex(t => t.username === username);
    
    if (teacherIndex === -1) throw new Error('Teacher not found');

    teachers[teacherIndex] = {
      ...teachers[teacherIndex],
      ...teacherData
    };

    const docRef = doc(db, ORGANIZATIONS_COLLECTION, schoolId);
    await updateDoc(docRef, { teachers });
    return await getSchoolById(schoolId);
  } catch (error) {
    console.error('Error updating teacher:', error);
    throw error;
  }
};

export const addTeacherToSchool = async (schoolId, teacherData) => {
  try {
    const school = await getSchoolById(schoolId);
    if (!school) throw new Error('School not found');

    const teachers = school.teachers || [];
    teachers.push({
      ...teacherData,
      createdAt: new Date().toISOString()
    });

    const docRef = doc(db, ORGANIZATIONS_COLLECTION, schoolId);
    await updateDoc(docRef, { teachers });
    return await getSchoolById(schoolId);
  } catch (error) {
    console.error('Error adding teacher:', error);
    throw error;
  }
};

export const deleteTeacher = async (schoolId, username) => {
  try {
    const school = await getSchoolById(schoolId);
    if (!school) throw new Error('School not found');

    const teachers = school.teachers || [];
    const updatedTeachers = teachers.filter(t => t.username !== username);
    
    if (updatedTeachers.length === teachers.length) {
      throw new Error('Teacher not found');
    }

    const docRef = doc(db, ORGANIZATIONS_COLLECTION, schoolId);
    await updateDoc(docRef, { teachers: updatedTeachers });
    return await getSchoolById(schoolId);
  } catch (error) {
    console.error('Error deleting teacher:', error);
    throw error;
  }
}; 