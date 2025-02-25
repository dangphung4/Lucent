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
 * Adds a new journal entry to the database.
 *
 * This function creates a new entry in the 'journalEntries' collection,
 * automatically generating an ID and timestamps for the entry. The type of
 * the entry is determined based on the provided productId.
 *
 * @param {Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>} entry - The journal entry data
 *        excluding the 'id', 'createdAt', and 'updatedAt' fields.
 * @returns {Promise<string>} A promise that resolves to the ID of the newly created journal entry.
 *
 * @throws {Error} Throws an error if there is an issue adding the journal entry to the database.
 *
 * @example
 * const newEntry = {
 *   productId: 'diary-entry',
 *   content: 'Today was a great day!',
 * };
 *
 * addJournalEntry(newEntry)
 *   .then(id => {
 *     console.log('Journal entry added with ID:', id);
 *   })
 *   .catch(error => {
 *     console.error('Failed to add journal entry:', error);
 *   });
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