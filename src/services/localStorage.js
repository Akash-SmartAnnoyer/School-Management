// Local Storage Keys
const STORAGE_KEYS = {
  ACADEMIC_CALENDAR: 'academic_calendar',
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  CLASSES: 'classes',
  ATTENDANCE: 'attendance',
  FINANCE: 'finance'
};

// Generic functions
export const getData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting data from localStorage:', error);
    return [];
  }
};

export const setData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error setting data in localStorage:', error);
    return false;
  }
};

// Academic Calendar functions
export const getCalendarEvents = () => {
  return getData(STORAGE_KEYS.ACADEMIC_CALENDAR);
};

export const addCalendarEvent = (event) => {
  const events = getCalendarEvents();
  events.push({
    id: Date.now().toString(),
    ...event,
    createdAt: new Date().toISOString()
  });
  setData(STORAGE_KEYS.ACADEMIC_CALENDAR, events);
  return events;
};

export const updateCalendarEvent = (eventId, updatedEvent) => {
  const events = getCalendarEvents();
  const index = events.findIndex(event => event.id === eventId);
  if (index !== -1) {
    events[index] = {
      ...events[index],
      ...updatedEvent,
      updatedAt: new Date().toISOString()
    };
    setData(STORAGE_KEYS.ACADEMIC_CALENDAR, events);
  }
  return events;
};

export const deleteCalendarEvent = (eventId) => {
  const events = getCalendarEvents();
  const filteredEvents = events.filter(event => event.id !== eventId);
  setData(STORAGE_KEYS.ACADEMIC_CALENDAR, filteredEvents);
  return filteredEvents;
};

// Sample data initialization
export const initializeSampleData = () => {
  // Check if data already exists
  if (getCalendarEvents().length === 0) {
    const sampleEvents = [
      {
        id: '1',
        title: 'School Opening Day',
        date: new Date('2024-06-01'),
        type: 'EVENT',
        description: 'First day of the academic year',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Independence Day',
        date: new Date('2024-08-15'),
        type: 'HOLIDAY',
        description: 'National holiday',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Mid-term Examination',
        date: new Date('2024-09-15'),
        type: 'EXAM',
        description: 'Mid-term examinations for all classes',
        createdAt: new Date().toISOString()
      }
    ];
    setData(STORAGE_KEYS.ACADEMIC_CALENDAR, sampleEvents);
  }
}; 