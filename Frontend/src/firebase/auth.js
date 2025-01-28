import axios from "axios";
import { auth, db } from "./config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const BASE_URL = "http://localhost:8000";

/**
 * Check if the email domain is blocked.
 * Feel free to adjust the domain list or remove it entirely if you want
 * to allow these providers.
 */
const isBlockedEmailDomain = (email) => {
  const blockedDomains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "aol.com",
    "icloud.com",
  ];
  const domain = email.split("@")[1];
  return blockedDomains.includes(domain);
};

/**
 * Sign up a new user using Firebase.
 * Also inserts them into MongoDB (via /auth/users) and stores the
 * returned Mongo userId in localStorage.
 */
export const signUp = async (email, password, fullName, companyName) => {
  // 1) Optionally block certain domains
  if (isBlockedEmailDomain(email)) {
    throw new Error("Email address from this domain is not allowed.");
  }

  // 2) Create user in Firebase
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;

  // 3) Send verification email
  await sendEmailVerification(user);

  // 4) Store some user details in Firestore (optional)
  await setDoc(doc(db, "users", user.uid), {
    email,
    fullName,
    companyName,
  });

  // 5) Create the user in MongoDB (backend)
  try {
    const response = await axios.post(`${BASE_URL}/auth/users`, {
      email,
      fullName,
      companyName,
    });
    // The backend returns { userId: ... }
    const { userId } = response.data;

    // 6) Store that Mongo userId in localStorage
    localStorage.setItem("loggedInMongoUserId", userId);

    // If you want to store the Firebase UID also:
    // localStorage.setItem("loggedInFirebaseUid", user.uid);

    return user;
  } catch (error) {
    console.error("Error saving data to MongoDB:", error.message);
    // Optionally sign out the user from Firebase if an error occurs
    throw error;
  }
};

/**
 * Sign in an existing user using Firebase.
 * Also look up their Mongo `_id` by emailing your backend's "get-user-by-email" route
 * so you have the user `_id` in localStorage as well.
 */
export const signIn = async (email, password) => {
  // 1) Block certain domains if needed
  if (isBlockedEmailDomain(email)) {
    throw new Error("Email address from this domain is not allowed.");
  }

  // 2) Sign in with Firebase
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // 3) If the user’s not verified, sign them out
  if (!user.emailVerified) {
    await auth.signOut();
    throw new Error(
      "We have sent you a verification mail. Please verify your email before signing in."
    );
  }

  // 4) Retrieve the user doc from Mongo by email
  try {
    const response = await axios.post(`${BASE_URL}/api/users/get-user-by-email`, {
      email,
    });
    // The server might return { _id: "...", userEmail: "...", etc. }
    const mongoUser = response.data;

    // 5) Store the Mongo userId in localStorage
    if (mongoUser && mongoUser._id) {
      localStorage.setItem("loggedInMongoUserId", mongoUser._id);
    }

    // You may also want to store the Firebase UID if you need it
    // localStorage.setItem("loggedInFirebaseUid", user.uid);

    return user;
  } catch (error) {
    console.error("Error fetching user from Mongo:", error.message);
    // If you want to sign them out on error:
    await auth.signOut();
    throw error;
  }
};

/**
 * Send a password reset email using Firebase.
 */
export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};
