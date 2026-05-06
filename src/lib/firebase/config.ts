// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCuawUDBERG37djResf2Sq8oNl2fvD49jM",
  authDomain: "login-dbms.firebaseapp.com",
  projectId: "login-dbms",
  storageBucket: "login-dbms.firebasestorage.app",
  messagingSenderId: "758402707171",
  appId: "1:758402707171:web:51f4ea8259f0042fcc9fd6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
