# School Management System

A modern web-based school management system built with React and Firebase, featuring a comprehensive set of tools for managing students, teachers, classes, and administrative tasks.

## Features

- 📚 Student Management
- 👨‍🏫 Teacher Management
- 📊 Dashboard with Analytics
- 📅 Attendance Tracking
- 📝 Grade Management
- 📋 Report Generation
- 🔐 User Authentication
- 📱 Responsive Design

## Tech Stack

- **Frontend Framework:** React.js
- **UI Libraries:** 
  - Ant Design
  - Material-UI
  - Emotion (Styled Components)
- **State Management:** React Context API
- **Backend:** Firebase
- **Authentication:** Firebase Auth
- **Database:** Firestore
- **File Storage:** Cloudinary
- **Charts & Analytics:** 
  - Ant Design Charts
  - Recharts
- **PDF Generation:** jsPDF
- **Excel Handling:** XLSX
- **Date Handling:** Moment.js

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- Cloudinary account

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/school-management.git
cd school-management
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
```

4. Initialize Firebase:
```bash
npm run initialize-firestore
# or
yarn initialize-firestore
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App
- `npm run initialize-firestore` - Initializes Firestore with required collections

## Project Structure

```
school-management/
├── public/          # Static files
├── src/
│   ├── components/  # Reusable components
│   ├── pages/       # Page components
│   ├── services/    # API and service functions
│   ├── utils/       # Utility functions
│   ├── scripts/     # Initialization scripts
│   └── App.js       # Main application component
├── .env             # Environment variables
└── package.json     # Project dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
