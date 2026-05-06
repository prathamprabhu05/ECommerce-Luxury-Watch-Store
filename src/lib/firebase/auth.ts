import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

// Register a new user with email and password
export const registerUser = async (name: string, email: string, password: string) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if user is admin
    const isAdmin = email === 'admin@mywatches.in';

    // Store additional user data in Firestore "users" collection
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name: name,
      email: email,
      isAdmin: isAdmin,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      uid: user.uid,
      name: name,
      email: email,
      isAdmin: isAdmin,
    };
  } catch (error: any) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Login user with email and password
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if user is admin
    const isAdmin = email === 'admin@mywatches.in';

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        uid: user.uid,
        name: userData.name,
        email: user.email || email,
        isAdmin: isAdmin,
      };
    } else {
      // If user document doesn't exist, create it
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: isAdmin ? 'Admin' : user.email?.split('@')[0] || 'User',
        email: user.email || email,
        isAdmin: isAdmin,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        uid: user.uid,
        name: isAdmin ? 'Admin' : user.email?.split('@')[0] || 'User',
        email: user.email || email,
        isAdmin: isAdmin,
      };
    }
  } catch (error: any) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

// Listen to auth state changes
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get user data from Firestore
export const getUserData = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error: any) {
    console.error('Error getting user data:', error);
    throw error;
  }
};
