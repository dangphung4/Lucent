// Database utilities for Firestore

import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { app } from './firebase';

const db = getFirestore(app);

export interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: Date;
  lastLoginAt: Date;
  userId: string;
  username?: string; // Optional username for profile URL
}

/**
 * Get a user profile from Firestore
 */
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as User;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

/**
 * Create a new user profile in Firestore
 */
export const createUserProfile = async (user: User): Promise<void> => {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, user);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

/**
 * Update an existing user profile in Firestore
 */
export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Check if a username is available
 */
export const isUsernameAvailable = async (username: string): Promise<boolean> => {
  try {
    // In a real app, you would query Firestore to check if the username exists
    // This would typically involve a query to check if any user has this username
    console.log(`Checking if username ${username} is available`);
    return true;
  } catch (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
};

