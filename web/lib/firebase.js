import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyD_JEa-2Wz3JFWm3zuqaSCcHbqaQyJivvI',
  authDomain: 'timetablegenerator-91747.firebaseapp.com',
  projectId: 'timetablegenerator-91747',
  storageBucket: 'timetablegenerator-91747.firebasestorage.app',
  messagingSenderId: '118104266627',
  appId: '1:118104266627:web:b9b20eb69db624a5c048b6'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
