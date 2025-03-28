import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  User, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { app, googleProvider } from './firebase';
import { getUserProfile, updateUserProfile, User as DbUser } from './db';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  logOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateUserData: (data: { displayName?: string; photoURL?: string; username?: string; skinType?: 'oily' | 'dry' | 'combination' | 'normal' | 'sensitive' }) => Promise<void>;
  userProfile: DbUser | null;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  logOut: async () => {},
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  updateUserData: async () => {},
  userProfile: null
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create initial user document in Firestore
    const initialUserData: DbUser = {
      id: user.uid,
      userId: user.uid,
      displayName: user.displayName || email.split('@')[0],
      email: user.email || '',
      photoURL: user.photoURL || '',
      createdAt: new Date(),
      lastLoginAt: new Date(),
      username: undefined,
      skinType: 'combination'
    };
    
    await updateUserProfile(user.uid, initialUserData);
  };

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user document exists
    const existingProfile = await getUserProfile(user.uid);
    
    if (!existingProfile) {
      // Create initial user document in Firestore
      const initialUserData: DbUser = {
        id: user.uid,
        userId: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        username: undefined,
        skinType: 'combination'
      };
      
      await updateUserProfile(user.uid, initialUserData);
    } else {
      // Update last login time for existing user
      await updateUserProfile(user.uid, {
        lastLoginAt: new Date()
      });
    }
  };

  const updateUserData = async (data: { displayName?: string; photoURL?: string; username?: string; skinType?: 'oily' | 'dry' | 'combination' | 'normal' | 'sensitive' }) => {
    if (!currentUser) throw new Error('No user is signed in');
    
    const { displayName, photoURL, username, skinType } = data;
    
    // Update Firebase Auth profile
    if (displayName || photoURL) {
      await firebaseUpdateProfile(currentUser, {
        displayName: displayName || currentUser.displayName,
        photoURL: photoURL || currentUser.photoURL
      });
    }
    
    // Update Firestore profile - handle undefined values according to User interface
    const updateData: Partial<DbUser> = {
      displayName: displayName || currentUser.displayName || '',
      photoURL: photoURL || currentUser.photoURL || '',
    };

    // Only include optional fields if they have values
    if (username !== undefined) {
      updateData.username = username || undefined;
    }
    if (skinType !== undefined) {
      updateData.skinType = skinType; // Always update skin type if provided
    }
    
    await updateUserProfile(currentUser.uid, updateData);
    
    // Refresh user profile
    const updatedProfile = await getUserProfile(currentUser.uid);
    if (updatedProfile) {
      setUserProfile(updatedProfile);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user profile from Firestore
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  const value = {
    currentUser,
    loading,
    logOut,
    signIn,
    signUp,
    signInWithGoogle,
    updateUserData,
    userProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 