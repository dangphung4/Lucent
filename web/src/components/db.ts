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
  createdAt: Date;
  updatedAt: Date;
  type?: 'diary' | 'product'; // Add type field to distinguish between diary entries and product reviews
}

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