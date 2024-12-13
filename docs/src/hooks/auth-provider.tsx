'use client';

import React, {useContext, useEffect} from 'react';
import {onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, User,} from 'firebase/auth';
import {auth, githubProvider} from "@/lib/firebase";

import {deleteCookie, setCookie} from "@/lib/cookies";
import {useRouter, useSearchParams} from "next/navigation";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGithub: () => Promise<void>;
    logout: () => Promise<void>;
}


export const AuthContext = React.createContext<AuthContextType>({} as AuthContextType);


export const useAuthContext = () => React.useContext(AuthContext);


export function AuthContentProvider({children}: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                setCookie('authenticated', 'true');
                const returnPath = searchParams.get('from');
                if (returnPath) {
                    router.push(returnPath);
                }
            }
            // else {
            //     deleteCookie('authenticated');
            //     const currentPath = window.location.pathname;
            //     if (currentPath !== '/auth' && currentPath !== '/') {
            //         router.push('/auth');
            //     }
            // }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router, searchParams]);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);


    const signInWithGithub = async () => {
        try {
            await signInWithPopup(auth, githubProvider);

        } catch (error: any) {
            if (error.code === 'auth/popup-blocked') {
                await signInWithRedirect(auth, githubProvider);
            } else {
                throw error;
            }
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            deleteCookie('authenticated');
        } catch (error) {
            console.error("Error signing out:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{user, loading, signInWithGithub, logout}}>
            {loading ? <div>Loading...</div> : children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);