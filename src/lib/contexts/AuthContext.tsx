"use client";

import React, { createContext, useEffect, useState } from "react";
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  OAuthProvider,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  User,
  AuthError 
} from "firebase/auth";
import { auth } from "../firebase/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ success: boolean, error?: string }>;
  signInWithMicrosoft: () => Promise<{ success: boolean, error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean, error?: string }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ success: boolean, error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean, error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => ({ success: false }),
  signInWithMicrosoft: async () => ({ success: false }),
  signInWithEmail: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  resetPassword: async () => ({ success: false }),
  signOut: async () => {},
});

const ALLOWED_GOOGLE_EMAIL = 'ravibhim007@gmail.com';
const ALLOWED_DOMAIN = 'traffmobility.com';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      
      // Check if the email is the allowed one
      if (result.user.email?.toLowerCase() !== ALLOWED_GOOGLE_EMAIL.toLowerCase()) {
        // Sign out the user immediately
        await firebaseSignOut(auth);
        return { 
          success: false, 
          error: 'Access restricted. Only specific Google accounts are allowed.' 
        };
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error signing in with Google", error);
      return { success: false, error: (error as AuthError).message };
    }
  };

  const signInWithMicrosoft = async () => {
    const provider = new OAuthProvider('microsoft.com');
    provider.setCustomParameters({
      // Request access to Microsoft Graph API
      prompt: 'consent',
      // Replace 'common' with the specific tenant ID
      tenant: '1921e89e-b20b-400d-8f37-cb87d5cca63f',
    });

    try {
      const result = await signInWithPopup(auth, provider);
      
      // Check if the email domain is the allowed one
      const email = result.user.email;
      if (!email || !email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)) {
        // Sign out the user immediately
        await firebaseSignOut(auth);
        return { 
          success: false, 
          error: `Access restricted. Only @${ALLOWED_DOMAIN} email addresses are allowed.` 
        };
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error signing in with Microsoft", error);
      return { success: false, error: (error as AuthError).message };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      console.error("Error signing in with email", error);
      let errorMessage = (error as AuthError).message;
      
      // Make error messages more user-friendly
      if (errorMessage.includes('user-not-found') || errorMessage.includes('wrong-password')) {
        errorMessage = 'Invalid email or password. Please try again.';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user profile with the display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error signing up", error);
      let errorMessage = (error as AuthError).message;
      
      // Make error messages more user-friendly
      if (errorMessage.includes('email-already-in-use')) {
        errorMessage = 'This email is already registered. Please try logging in instead.';
      } else if (errorMessage.includes('weak-password')) {
        errorMessage = 'Please use a stronger password (at least 6 characters).';
      } else if (errorMessage.includes('invalid-email')) {
        errorMessage = 'Please enter a valid email address.';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error("Error resetting password", error);
      let errorMessage = (error as AuthError).message;
      
      // Make error messages more user-friendly
      if (errorMessage.includes('user-not-found')) {
        errorMessage = 'No account found with this email address.';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const signOutUser = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signInWithGoogle,
      signInWithMicrosoft,
      signInWithEmail,
      signUp,
      resetPassword,
      signOut: signOutUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
