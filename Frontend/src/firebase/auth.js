import axios from "axios";
import { auth, db } from './config';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendEmailVerification,
    sendPasswordResetEmail 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const BASE_URL = 'https://growth-with-growthz.onrender.com';

const isBlockedEmailDomain = (email) => {
    const blockedDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "aol.com", "icloud.com"];
    return blockedDomains.includes(email.split('@')[1]);
};

export const signUp = async (email, password, fullName, companyName) => {
    if (isBlockedEmailDomain(email)) {
        throw new Error("Email address from this domain is not allowed.");
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await sendEmailVerification(user);

    // Store in Firestore
    await setDoc(doc(db, "users", user.uid), {
        email,
        fullName,
        companyName,
    });

    // Store in MongoDB by hitting the backend API
    try {
        await axios.post(`${BASE_URL}/auth/users`, {
            email,
            fullName,
            companyName,
        });
    } catch (error) {
        console.error("Error saving data to MongoDB:", error.message);
    }

    return user;
};

export const signIn = async (email, password) => {
  if (isBlockedEmailDomain(email)) {
      throw new Error('Email address from this domain is not allowed.');
  }

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  if (!userCredential.user.emailVerified) {
      await auth.signOut();
      throw new Error('We have sent you a verification mail. Please verify your email before signing in.');
  }
  
  localStorage.setItem('loggedInUserId', userCredential.user.uid);
  return userCredential.user;
};

export const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
};
