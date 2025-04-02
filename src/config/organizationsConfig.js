export const organizationsConfig = {
  schools: {
    'usha-vidyalayam': {
      id: 'usha-vidyalayam',
      name: 'Usha Vidyalayam',
      address: 'School Address',
      phone: '1234567890',
      email: 'school@ushavidyalayam.com',
      logo: 'https://via.placeholder.com/150',
      principal: {
        username: 'usha_principal',
        password: 'admin123', // In production, use proper auth system
        name: 'Dr. Principal Name',
        email: 'principal@ushavidyalayam.com',
        profilePic: 'https://via.placeholder.com/150',
        role: 'PRINCIPAL'
      },
      teachers: [
        {
          id: 'teacher1',
          username: 'teacher1',
          password: 'teacher123',
          name: 'John Doe',
          email: 'john@ushavidyalayam.com',
          profilePic: 'https://via.placeholder.com/150',
          role: 'TEACHER',
          subject: 'Mathematics',
          phone: '9876543210'
        }
      ]
    },
    // Add other schools similarly...
  }
};

export const getSchoolConfig = (schoolId) => {
  return organizationsConfig.schools[schoolId];
};

export const validateCredentials = (username, password, role) => {
  for (const [schoolId, school] of Object.entries(organizationsConfig.schools)) {
    if (role === 'PRINCIPAL') {
      if (username === school.principal.username && password === school.principal.password) {
        return {
          ...school.principal,
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
          schoolId,
          schoolName: school.name,
          schoolLogo: school.logo
        };
      }
    }
  }
  return null;
}; 