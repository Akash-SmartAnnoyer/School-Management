// Organization configuration file
export const organizations = {
  // Each school will have its own configuration
  schools: {
    // Example school configuration
    'usha-vidyalayam': {
      id: 'usha-vidyalayam',
      name: 'Usha Vidyalayam',
      address: 'School Address',
      phone: 'School Phone',
      email: 'school@email.com',
      logo: 'https://via.placeholder.com/150',
      // Principal account configuration
      principal: {
        username: 'usha_principal',
        password: 'admin123', // This should be changed in production
        name: 'Dr. Principal Name',
        email: 'principal@ushavidyalayam.com',
        profilePic: 'https://via.placeholder.com/150'
      },
      // Teachers will be added by the principal
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
        password: 'admin123', // This should be changed in production
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
        password: 'admin123', // This should be changed in production
        name: 'Dr. Principal Name',
        email: 'principal@davpublic.com',
        profilePic: 'https://via.placeholder.com/150'
      },
      teachers: []
    }
  }
};

// Helper function to get school configuration
export const getSchoolConfig = (schoolId) => {
  return organizations.schools[schoolId];
};

// Helper function to validate credentials and return user with school info
export const validateCredentials = (username, password, role) => {
  // Search through all schools
  for (const [schoolId, school] of Object.entries(organizations.schools)) {
    if (role === 'PRINCIPAL') {
      if (username === school.principal.username && password === school.principal.password) {
        return {
          ...school.principal,
          role: 'PRINCIPAL',
          schoolId,
          schoolName: school.name,
          schoolLogo: school.logo
        };
      }
    } else if (role === 'TEACHER') {
      const teacher = school.teachers.find(t => t.username === username && t.password === password);
      if (teacher) {
        return {
          ...teacher,
          role: 'TEACHER',
          schoolId,
          schoolName: school.name,
          schoolLogo: school.logo
        };
      }
    }
  }
  return null;
};

// Helper function to add a new teacher to a school
export const addTeacherToSchool = (schoolId, teacherData) => {
  const school = organizations.schools[schoolId];
  if (!school) return false;

  school.teachers.push({
    ...teacherData,
    createdAt: new Date().toISOString()
  });
  return true;
}; 