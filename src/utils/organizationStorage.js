import { organizations as defaultOrganizations } from '../config/organizations';

const STORAGE_KEY = 'school_organizations';

export const getOrganizations = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : defaultOrganizations;
};

export const saveOrganizations = (organizations) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(organizations));
};

export const updateSchool = (schoolId, schoolData) => {
  const organizations = getOrganizations();
  organizations.schools[schoolId] = {
    ...organizations.schools[schoolId],
    ...schoolData
  };
  saveOrganizations(organizations);
  return organizations;
};

export const updatePrincipal = (schoolId, principalData) => {
  const organizations = getOrganizations();
  organizations.schools[schoolId].principal = {
    ...organizations.schools[schoolId].principal,
    ...principalData
  };
  saveOrganizations(organizations);
  return organizations;
};

export const updateTeacher = (schoolId, username, teacherData) => {
  const organizations = getOrganizations();
  const school = organizations.schools[schoolId];
  const teacherIndex = school.teachers.findIndex(t => t.username === username);
  if (teacherIndex !== -1) {
    school.teachers[teacherIndex] = {
      ...school.teachers[teacherIndex],
      ...teacherData
    };
    saveOrganizations(organizations);
  }
  return organizations;
}; 