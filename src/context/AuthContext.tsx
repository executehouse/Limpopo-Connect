import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import type { User, UserProfile } from '../types';
import { UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, profile: Partial<UserProfile>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.data();
        
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || undefined,
          photoURL: firebaseUser.photoURL || undefined,
          emailVerified: firebaseUser.emailVerified,
          role: userData?.role || UserRole.USER,
          profile: userData?.profile
        };
        
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    profile: Partial<UserProfile>
  ): Promise<void> => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth profile
      if (profile.firstName && profile.lastName) {
        await updateProfile(firebaseUser, {
          displayName: `${profile.firstName} ${profile.lastName}`
        });
      }

      // Create user document in Firestore
      const userProfile: UserProfile = {
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone,
        location: profile.location,
        preferences: {
          language: 'en',
          notifications: true,
          theme: 'system'
        },
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        email: firebaseUser.email,
        role: UserRole.USER,
        profile: userProfile
      });

      // Send email verification
      await sendEmailVerification(firebaseUser);
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      const provider = new GoogleAuthProvider();
      const { user: firebaseUser } = await signInWithPopup(auth, provider);
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // Create new user document for Google sign-in
        const [firstName, ...lastNameParts] = (firebaseUser.displayName || '').split(' ');
        
        const userProfile: UserProfile = {
          firstName: firstName || '',
          lastName: lastNameParts.join(' ') || '',
          preferences: {
            language: 'en',
            notifications: true,
            theme: 'system'
          },
          isVerified: firebaseUser.emailVerified,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), {
          email: firebaseUser.email,
          role: UserRole.USER,
          profile: userProfile
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user) throw new Error('No authenticated user');
    
    try {
      const updatedProfile = {
        ...updates,
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'users', user.id), {
        'profile': { ...user.profile, ...updatedProfile }
      });

      // Update Firebase Auth profile if name changed
      if (updates.firstName || updates.lastName) {
        const displayName = `${updates.firstName || user.profile?.firstName} ${updates.lastName || user.profile?.lastName}`;
        await updateProfile(auth.currentUser!, { displayName });
      }
    } catch (error) {
      throw error;
    }
  };

  const sendVerificationEmail = async (): Promise<void> => {
    if (!auth.currentUser) throw new Error('No authenticated user');
    
    try {
      await sendEmailVerification(auth.currentUser);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    updateUserProfile,
    sendVerificationEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}