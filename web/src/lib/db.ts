/* eslint-disable @typescript-eslint/no-explicit-any */
// Database utilities for Firestore

import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, getDocs, where, deleteDoc } from 'firebase/firestore';
import { app } from './firebase';
import { ref, listAll, getDownloadURL, getMetadata } from 'firebase/storage';
import { storage } from './firebase';

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

export interface Product {
  id: string;
  userId: string;
  name: string;
  brand: string;
  category: string | null;
  description: string | null;
  ingredients: string[] | null;
  imageUrl: string | null;
  purchaseDate: Date | null;
  expiryDate: Date | null;
  price: number | null;
  size: string | null;
  rating: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'finished';
  wouldRepurchase: boolean;
  usageDuration: number;
}

export interface RoutineStep {
  productId: string;
  order: number;
  notes?: string;
}

export interface Routine {
  id: string;
  userId: string;
  name: string;
  type: 'morning' | 'evening' | 'weekly' | 'custom';
  description?: string;
  steps: RoutineStep[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface RoutineCompletion {
  id: string;
  userId: string;
  routineId: string;
  type: 'morning' | 'evening' | 'weekly' | 'custom';
  date: Date;
  completedSteps: Array<{
    productId: string;
    completed: boolean;
    notes?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalEntry {
  id: string;
  userId: string;
  productId: string;
  date: Date;
  rating: number;
  review: string;
  effects: string[];
  usageDuration: number; // in days
  notes: string;
  createdAt?: Date;
  updatedAt?: Date;
  type?: 'diary' | 'product'; // Add type field to distinguish between diary entries and product reviews
  title?: string; // Add title field for diary entries
}

export interface ProgressLog {
  id: string;
  userId: string;
  date: Date;
  title: string;
  description: string;
  photoStoragePath: string; // Required - no longer optional
  photoUrl: string; // Required - no longer optional
  tags?: string[];
  mood?: string;
  concerns?: string[];
  improvements?: string[];
  relatedJournalEntryIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgressPhoto {
  id: string; // This will be the timestamp from the filename
  userId: string;
  date: Date;
  name?: string;
  storagePath: string;
  url: string;
  hasLog: boolean;
  logId?: string;
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

/**
 * Add a new product to Firestore
 */
export const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const productsRef = doc(collection(db, 'products'));
    
    // Create the product data with required fields
    const productData = {
      ...product,
      id: productsRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: product.status || 'active',
      wouldRepurchase: product.status === 'finished' ? (product.wouldRepurchase || false) : false,
      // Ensure optional fields are null instead of undefined
      category: product.category || null,
      description: product.description || null,
      ingredients: product.ingredients || null,
      imageUrl: product.imageUrl || null,
      purchaseDate: product.purchaseDate || null,
      expiryDate: product.expiryDate || null,
      price: product.price || null,
      size: product.size || null,
      rating: product.rating || null,
      notes: product.notes || null,
    };
    
    await setDoc(productsRef, productData);
    return productsRef.id;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

/**
 * Get all products for a user
 */
export const getUserProducts = async (userId: string): Promise<Product[]> => {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Product;
    });
  } catch (error) {
    console.error('Error getting user products:', error);
    throw error;
  }
};

/**
 * Update an existing product
 */
export const updateProduct = async (productId: string, data: Partial<Product>): Promise<void> => {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      ...data,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

/**
 * Add a new routine to Firestore
 */
export const addRoutine = async (routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const routinesRef = doc(collection(db, 'routines'));
    
    const routineData = {
      ...routine,
      id: routinesRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };
    
    await setDoc(routinesRef, routineData);
    return routinesRef.id;
  } catch (error) {
    console.error('Error adding routine:', error);
    throw error;
  }
};

/**
 * Get all routines for a user
 */
export const getUserRoutines = async (userId: string): Promise<Routine[]> => {
  try {
    const routinesRef = collection(db, 'routines');
    const q = query(routinesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Routine;
    });
  } catch (error) {
    console.error('Error getting user routines:', error);
    throw error;
  }
};

/**
 * Update an existing routine
 */
export const updateRoutine = async (routineId: string, data: Partial<Routine>): Promise<void> => {
  try {
    const routineRef = doc(db, 'routines', routineId);
    await updateDoc(routineRef, {
      ...data,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating routine:', error);
    throw error;
  }
};

/**
 * Delete a routine
 */
export const deleteRoutine = async (routineId: string): Promise<void> => {
  try {
    const routineRef = doc(db, 'routines', routineId);
    await deleteDoc(routineRef);
  } catch (error) {
    console.error('Error deleting routine:', error);
    throw error;
  }
};

/**
 * Add a new routine completion record
 */
export const addRoutineCompletion = async (completion: Omit<RoutineCompletion, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const completionsRef = doc(collection(db, 'routineCompletions'));
    
    // Ensure date is a proper Firestore timestamp
    const completionData = {
      ...completion,
      id: completionsRef.id,
      // Make sure the date is set to midnight to ensure consistent date comparisons
      date: new Date(
        completion.date.getFullYear(),
        completion.date.getMonth(),
        completion.date.getDate(),
        0, 0, 0
      ),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    console.log('Adding routine completion:', completionData);
    await setDoc(completionsRef, completionData);
    return completionsRef.id;
  } catch (error) {
    console.error('Error adding routine completion:', error);
    throw error;
  }
};

/**
 * Get routine completions for a specific date range
 */
export const getRoutineCompletions = async (userId: string, startDate: Date, endDate: Date): Promise<RoutineCompletion[]> => {
  try {
    console.log('Fetching completions for date range:', startDate, 'to', endDate);
    
    const completionsRef = collection(db, 'routineCompletions');
    
    // First, get all completions for the user
    const userCompletionsQuery = query(
      completionsRef,
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(userCompletionsQuery);
    
    // Then filter by date in JavaScript
    const completions = querySnapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          ...data,
          date: data.date?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as RoutineCompletion;
      })
      .filter(completion => {
        const completionDate = completion.date;
        return completionDate >= startDate && completionDate <= endDate;
      });
    
    console.log('Found completions:', completions.length);
    return completions;
  } catch (error) {
    console.error('Error getting routine completions:', error);
    throw error;
  }
};

/**
 * Update a routine completion record
 */
export const updateRoutineCompletion = async (completionId: string, data: Partial<RoutineCompletion>): Promise<void> => {
  try {
    const completionRef = doc(db, 'routineCompletions', completionId);
    await updateDoc(completionRef, {
      ...data,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating routine completion:', error);
    throw error;
  }
};

/**
 * Add a new journal entry
 */
export const addJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const entriesRef = doc(collection(db, 'journalEntries'));
    
    const entryData = {
      ...entry,
      id: entriesRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      type: entry.productId === 'diary-entry' ? 'diary' : 'product', // Set type based on productId
    };
    
    await setDoc(entriesRef, entryData);
    return entriesRef.id;
  } catch (error) {
    console.error('Error adding journal entry:', error);
    throw error;
  }
};

/**
 * Get journal entries for a user
 */
export const getUserJournalEntries = async (userId: string): Promise<JournalEntry[]> => {
  try {
    const entriesRef = collection(db, 'journalEntries');
    const q = query(entriesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        date: data.date?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as JournalEntry;
    });
  } catch (error) {
    console.error('Error getting user journal entries:', error);
    throw error;
  }
};

/**
 * Update a journal entry
 */
export const updateJournalEntry = async (entryId: string, data: Partial<JournalEntry>): Promise<void> => {
  try {
    const entryRef = doc(db, 'journalEntries', entryId);
    await updateDoc(entryRef, {
      ...data,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    throw error;
  }
};

/**
 * Delete a journal entry
 */
export const deleteJournalEntry = async (entryId: string): Promise<void> => {
  try {
    const entryRef = doc(db, 'journalEntries', entryId);
    await deleteDoc(entryRef);
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    throw error;
  }
};

/**
 * Add a new progress log entry
 */
export const addProgressLog = async (log: Omit<ProgressLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const logsRef = doc(collection(db, 'progressLogs'));
    
    const logData = {
      ...log,
      id: logsRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setDoc(logsRef, logData);
    return logsRef.id;
  } catch (error) {
    console.error('Error adding progress log:', error);
    throw error;
  }
};

/**
 * Get progress logs for a user
 */
export const getUserProgressLogs = async (userId: string): Promise<ProgressLog[]> => {
  try {
    const logsRef = collection(db, 'progressLogs');
    const q = query(logsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        date: data.date?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as ProgressLog;
    });
  } catch (error) {
    console.error('Error getting user progress logs:', error);
    throw error;
  }
};

/**
 * Update a progress log
 */
export const updateProgressLog = async (logId: string, data: Partial<ProgressLog>): Promise<void> => {
  try {
    const logRef = doc(db, 'progressLogs', logId);
    await updateDoc(logRef, {
      ...data,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating progress log:', error);
    throw error;
  }
};

/**
 * Delete a progress log
 */
export const deleteProgressLog = async (logId: string): Promise<void> => {
  try {
    const logRef = doc(db, 'progressLogs', logId);
    await deleteDoc(logRef);
  } catch (error) {
    console.error('Error deleting progress log:', error);
    throw error;
  }
};

/**
 * Get all progress photos for a user, with information about whether they have logs
 */
export const getUserProgressPhotos = async (userId: string): Promise<ProgressPhoto[]> => {
  try {
    // First, get all logs to know which photos have logs
    const logsRef = collection(db, 'progressLogs');
    const logsQuery = query(logsRef, where('userId', '==', userId));
    const logsSnapshot = await getDocs(logsQuery);
    
    // Create a map of photo paths to log IDs
    const photoLogMap = new Map<string, string>();
    logsSnapshot.docs.forEach(doc => {
      const log = doc.data();
      photoLogMap.set(log.photoStoragePath, doc.id);
    });
    
    // Get all photos from Firebase Storage
    const storageRef = ref(storage, `progress/${userId}`);
    const result = await listAll(storageRef);
    
    // Map photos to ProgressPhoto objects
    const photoPromises = result.items.map(async (item) => {
      const url = await getDownloadURL(item);
      const metadata = await getMetadata(item);
      const timestamp = parseInt(item.name.split('_')[0]);
      const hasLog = photoLogMap.has(item.fullPath);
      
      return {
        id: timestamp.toString(),
        userId,
        date: new Date(timestamp),
        name: metadata.customMetadata?.name,
        storagePath: item.fullPath,
        url,
        hasLog,
        logId: hasLog ? photoLogMap.get(item.fullPath) : undefined
      };
    });
    
    return await Promise.all(photoPromises);
  } catch (error) {
    console.error('Error getting user progress photos:', error);
    throw error;
  }
};

/**
 * Get a progress log by photo storage path
 */
export const getProgressLogByPhotoPath = async (userId: string, photoStoragePath: string): Promise<ProgressLog | null> => {
  try {
    const logsRef = collection(db, 'progressLogs');
    const q = query(
      logsRef, 
      where('userId', '==', userId),
      where('photoStoragePath', '==', photoStoragePath)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const data = querySnapshot.docs[0].data();
    return {
      ...data,
      id: querySnapshot.docs[0].id,
      date: data.date?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as ProgressLog;
  } catch (error) {
    console.error('Error getting progress log by photo path:', error);
    throw error;
  }
};

