import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { extractUserId, isInstituteEmail } from '../utils';

export interface UserData {
    userId: string;
    name: string;
    email: string;
    rollNumber: string;
    registrationNumber: string;
    department: string;
    role: string;
    password: string;
    createdAt: Date;
}

interface AuthContextType {
    user: UserData | null;
    firebaseUser: FirebaseUser | null;
    isLoading: boolean;
    error: string | null;
    needsPasswordSetup: boolean;
    loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
    loginWithCredentials: (userId: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    updateUser: (data: Partial<UserData>) => Promise<{ success: boolean; error?: string }>;
    setPassword: (password: string) => Promise<{ success: boolean; error?: string }>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            setFirebaseUser(fbUser);
            if (fbUser && fbUser.email) {
                const userData = await fetchUserData(fbUser.email);
                if (userData) {
                    setUser(userData);
                    setNeedsPasswordSetup(!userData.password);
                }
            } else {
                setUser(null);
                setNeedsPasswordSetup(false);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const fetchUserData = async (email: string): Promise<UserData | null> => {
        try {
            const userId = extractUserId(email);
            const userDoc = await getDoc(doc(db, 'Users', userId));
            if (userDoc.exists()) {
                const data = userDoc.data() as UserData;
                return {
                    ...data,
                    name: data.name || data.userId || 'User' // Robust fallback
                };
            }
            return null;
        } catch (err) {
            console.error('Error fetching user data:', err);
            return null;
        }
    };

    const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
        setError(null);
        setIsLoading(true);

        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const email = result.user.email;

            if (!email || !isInstituteEmail(email)) {
                await signOut(auth);
                setIsLoading(false);
                return { success: false, error: 'Please register using institute email only.' };
            }

            const userId = extractUserId(email);
            const existingUser = await getDoc(doc(db, 'Users', userId));

            if (existingUser.exists()) {
                const userData = existingUser.data() as UserData;
                setUser(userData);
                setNeedsPasswordSetup(!userData.password);
            } else {
                const newUser: UserData = {
                    userId,
                    name: result.user.displayName || '',
                    email: email,
                    rollNumber: '',
                    registrationNumber: '',
                    department: '',
                    role: 'student',
                    password: '',
                    createdAt: new Date(),
                };

                await setDoc(doc(db, 'Users', userId), newUser);
                setUser(newUser);
                setNeedsPasswordSetup(true);
            }

            setIsLoading(false);
            return { success: true };
        } catch (err) {
            console.error('Google login error:', err);
            setIsLoading(false);
            return { success: false, error: 'Login failed. Please try again.' };
        }
    };

    const loginWithCredentials = async (userId: string, password: string): Promise<{ success: boolean; error?: string }> => {
        setError(null);
        setIsLoading(true);

        try {
            const userDoc = await getDoc(doc(db, 'Users', userId.toUpperCase()));

            if (!userDoc.exists()) {
                setIsLoading(false);
                return { success: false, error: 'User not found. Please sign up first.' };
            }

            const userData = userDoc.data() as UserData;

            if (!userData.password) {
                setIsLoading(false);
                return { success: false, error: 'Password not set. Please use Google Sign-In.' };
            }

            if (userData.password !== password) {
                setIsLoading(false);
                return { success: false, error: 'Incorrect password.' };
            }

            setUser(userData);
            setNeedsPasswordSetup(false);
            setIsLoading(false);
            return { success: true };
        } catch (err) {
            console.error('Login error:', err);
            setIsLoading(false);
            return { success: false, error: 'Login failed. Please try again.' };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setNeedsPasswordSetup(false);
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const updateUser = async (data: Partial<UserData>): Promise<{ success: boolean; error?: string }> => {
        if (!user) return { success: false, error: 'Not logged in.' };

        try {
            const updatedData = { ...user, ...data };
            await setDoc(doc(db, 'Users', user.userId), updatedData);
            setUser(updatedData);
            return { success: true };
        } catch (err) {
            console.error('Update error:', err);
            return { success: false, error: 'Failed to update profile.' };
        }
    };

    const setPassword = async (password: string): Promise<{ success: boolean; error?: string }> => {
        const result = await updateUser({ password });
        if (result.success) {
            setNeedsPasswordSetup(false);
        }
        return result;
    };

    const clearError = () => setError(null);

    return (
        <AuthContext.Provider
            value={{
                user,
                firebaseUser,
                isLoading,
                error,
                needsPasswordSetup,
                loginWithGoogle,
                loginWithCredentials,
                logout,
                updateUser,
                setPassword,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
