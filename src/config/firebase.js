import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// require("dotenv").config();

// const firebaseConfig = {
//   apiKey: process.env.FIREBASE_API_KEY,
//   authDomain: process.env.FIREBASE_AUTH_DOMAIN,
//   projectId: "tipset-32a09",
//   storageBucket: "tipset-32a09.appspot.com",
//   messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.FIREBASE_APP_ID,
// };
const firebaseConfig = {
  apiKey: 'AIzaSyAsFMyV7Eb24qq1DIm5C2elzO0iHjHVL2c',
  authDomain: 'tipset-32a09.firebaseapp.com',
  projectId: 'tipset-32a09',
  storageBucket: 'tipset-32a09.appspot.com',
  messagingSenderId: '965814221343',
  appId: '1:965814221343:web:70f6c21ee5b3598dcf732a',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export const db = getFirestore(app);
