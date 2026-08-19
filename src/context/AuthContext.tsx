import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { syncUserProfile } from '../services/db';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  studentName: string;
  role: 'student' | 'admin';
  loading: boolean;
  isAdmin: boolean;
  loginAsStudent: (name: string) => Promise<void>;
  loginWithGoogleAdmin: () => Promise<void>;
  loginWithEmailAdmin: (email: string, pass: string) => Promise<void>;
  loginWithAdminPasskey: (passkey: string) => Promise<boolean>;
  updateStudentName: (newName: string) => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_NAME_KEY = 'cse_hub_student_name';
const LOCAL_STORAGE_ADMIN_TOKEN = 'cse_hub_admin_token';
const LOCAL_STORAGE_UID_KEY = 'cse_hub_local_uid';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [studentName, setStudentName] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_NAME_KEY) || '';
  });
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = () => setAuthError(null);

  // Check admin role from email, doc, or session token
  const checkIsAdmin = async (user: FirebaseUser | null): Promise<boolean> => {
    const hasAdminToken = localStorage.getItem(LOCAL_STORAGE_ADMIN_TOKEN) === 'true';
    if (hasAdminToken) return true;

    if (!user) return false;

    // Check specific owner email
    if (user.email && user.email.toLowerCase() === 'sanskargarg462@gmail.com') {
      return true;
    }

    try {
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      if (adminDoc.exists()) return true;
    } catch {
      // Ignored
    }

    return false;
  };

  useEffect(() => {
    // Initial check for existing local student session
    const storedName = localStorage.getItem(LOCAL_STORAGE_NAME_KEY);
    const hasAdminToken = localStorage.getItem(LOCAL_STORAGE_ADMIN_TOKEN) === 'true';

    if (hasAdminToken) {
      setRole('admin');
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const isAdminUser = await checkIsAdmin(user);
        const currentRole = isAdminUser ? 'admin' : 'student';
        setRole(currentRole);

        const name = user.displayName || storedName || (user.email ? user.email.split('@')[0] : 'Student');
        setStudentName(name);

        const profile: UserProfile = {
          userId: user.uid,
          displayName: name,
          role: currentRole,
          email: user.email || undefined,
          createdAt: user.metadata.creationTime || new Date().toISOString(),
          lastActive: new Date().toISOString(),
        };

        setUserProfile(profile);
        syncUserProfile(user.uid, name, currentRole, user.email || undefined).catch(() => {});
      } else {
        if (storedName) {
          let localUid = localStorage.getItem(LOCAL_STORAGE_UID_KEY);
          if (!localUid) {
            localUid = `student_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            localStorage.setItem(LOCAL_STORAGE_UID_KEY, localUid);
          }
          setStudentName(storedName);
          setUserProfile({
            userId: localUid,
            displayName: storedName,
            role: hasAdminToken ? 'admin' : 'student',
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
          });
        } else if (!hasAdminToken) {
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 1. STUDENT QUICK LOGIN WITH NAME
  const loginAsStudent = async (name: string): Promise<void> => {
    const trimmed = name.trim();
    if (!trimmed) {
      setAuthError('Please enter your name.');
      return;
    }
    setLoading(true);
    setAuthError(null);

    try {
      localStorage.removeItem(LOCAL_STORAGE_ADMIN_TOKEN);
      localStorage.setItem(LOCAL_STORAGE_NAME_KEY, trimmed);
      setStudentName(trimmed);

      let uid = '';
      let user = auth.currentUser;

      if (!user) {
        try {
          const cred = await signInAnonymously(auth);
          user = cred.user;
          uid = user.uid;
          await updateProfile(user, { displayName: trimmed }).catch(() => {});
        } catch (anonErr: any) {
          // If Anonymous auth is restricted in Firebase console, use a persistent client session UID
          let localUid = localStorage.getItem(LOCAL_STORAGE_UID_KEY);
          if (!localUid) {
            localUid = `student_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            localStorage.setItem(LOCAL_STORAGE_UID_KEY, localUid);
          }
          uid = localUid;
        }
      } else {
        uid = user.uid;
        await updateProfile(user, { displayName: trimmed }).catch(() => {});
      }

      const profile: UserProfile = {
        userId: uid,
        displayName: trimmed,
        role: 'student',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };

      setUserProfile(profile);
      setRole('student');
      syncUserProfile(uid, trimmed, 'student').catch(() => {});
    } catch (err: any) {
      console.warn('Student login fallback active:', err);
      // Ensure the student can still proceed even if network or auth service hiccups
      let localUid = localStorage.getItem(LOCAL_STORAGE_UID_KEY);
      if (!localUid) {
        localUid = `student_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem(LOCAL_STORAGE_UID_KEY, localUid);
      }
      setUserProfile({
        userId: localUid,
        displayName: trimmed,
        role: 'student',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      });
      setRole('student');
    } finally {
      setLoading(false);
    }
  };

  // 2. ADMIN GOOGLE SIGN IN
  const loginWithGoogleAdmin = async (): Promise<void> => {
    setLoading(true);
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const user = cred.user;

      localStorage.setItem(LOCAL_STORAGE_ADMIN_TOKEN, 'true');
      setRole('admin');

      const name = user.displayName || user.email?.split('@')[0] || 'Administrator';
      setStudentName(name);

      const profile: UserProfile = {
        userId: user.uid,
        displayName: name,
        role: 'admin',
        email: user.email || undefined,
        createdAt: user.metadata.creationTime || new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };
      setUserProfile(profile);

      // Register admin in admins collection
      try {
        await setDoc(
          doc(db, 'admins', user.uid),
          {
            email: user.email,
            displayName: name,
            grantedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (e) {
        console.warn('Could not write admin doc directly:', e);
      }

      syncUserProfile(user.uid, name, 'admin', user.email || undefined).catch(() => {});
    } catch (err: any) {
      console.error('Google Admin login failed:', err);
      setAuthError(err?.message || 'Failed to sign in with Google Admin.');
    } finally {
      setLoading(false);
    }
  };

  // 3. ADMIN EMAIL / PASSWORD LOGIN
  const loginWithEmailAdmin = async (email: string, pass: string): Promise<void> => {
    setLoading(true);
    setAuthError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const user = cred.user;
      localStorage.setItem(LOCAL_STORAGE_ADMIN_TOKEN, 'true');
      setRole('admin');

      const name = user.displayName || user.email?.split('@')[0] || 'Administrator';
      setStudentName(name);

      const profile: UserProfile = {
        userId: user.uid,
        displayName: name,
        role: 'admin',
        email: user.email || undefined,
        createdAt: user.metadata.creationTime || new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };
      setUserProfile(profile);
      syncUserProfile(user.uid, name, 'admin', user.email || undefined).catch(() => {});
    } catch (err: any) {
      console.error('Email Admin login failed:', err);
      setAuthError(err?.message || 'Invalid administrator email or password.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 4. ADMIN SECURE PASSKEY (Direct verified setup)
  const loginWithAdminPasskey = async (passkey: string): Promise<boolean> => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/admin/verify-passkey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: passkey.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Invalid administrator key');
      }

      // Try ensuring an authenticated firebase user exists
      let user = auth.currentUser;
      let uid = user?.uid;
      if (!user) {
        try {
          const cred = await signInAnonymously(auth);
          user = cred.user;
          uid = user.uid;
        } catch {
          let localUid = localStorage.getItem(LOCAL_STORAGE_UID_KEY);
          if (!localUid) {
            localUid = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            localStorage.setItem(LOCAL_STORAGE_UID_KEY, localUid);
          }
          uid = localUid;
        }
      }

      localStorage.setItem(LOCAL_STORAGE_ADMIN_TOKEN, 'true');
      setRole('admin');
      const name = 'Class Administrator';
      setStudentName(name);

      const profile: UserProfile = {
        userId: uid || 'admin_master',
        displayName: name,
        role: 'admin',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };
      setUserProfile(profile);
      if (uid) {
        syncUserProfile(uid, name, 'admin').catch(() => {});
      }
      return true;
    } catch (err: any) {
      console.error('Admin passkey verification error:', err);
      setAuthError(err?.message || 'Passkey verification failed.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 5. UPDATE STUDENT NAME
  const updateStudentName = async (newName: string): Promise<void> => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    localStorage.setItem(LOCAL_STORAGE_NAME_KEY, trimmed);
    setStudentName(trimmed);

    if (currentUser) {
      await updateProfile(currentUser, { displayName: trimmed }).catch(() => {});
    }

    if (userProfile) {
      setUserProfile({
        ...userProfile,
        displayName: trimmed,
      });
      syncUserProfile(userProfile.userId, trimmed, userProfile.role).catch(() => {});
    }
  };

  // 6. LOGOUT
  const logout = async (): Promise<void> => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_ADMIN_TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_NAME_KEY);
      localStorage.removeItem(LOCAL_STORAGE_UID_KEY);
      setRole('student');
      setStudentName('');
      setUserProfile(null);
      await signOut(auth).catch(() => {});
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        studentName,
        role,
        loading,
        isAdmin,
        loginAsStudent,
        loginWithGoogleAdmin,
        loginWithEmailAdmin,
        loginWithAdminPasskey,
        updateStudentName,
        logout,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
