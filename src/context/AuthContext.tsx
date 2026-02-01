import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signUp: (email: string, password: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    verifyPassword: (password: string) => Promise<void>;
    updateProfile: (updates: { full_name?: string; gender?: string }) => Promise<void>;
    updateEmail: (email: string) => Promise<void>;
    updatePassword: (password: string) => Promise<void>;
    deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Initialize auth state
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ? {
                id: session.user.id,
                email: session.user.email!,
                full_name: session.user.user_metadata?.full_name,
                gender: session.user.user_metadata?.gender
            } : null);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ? {
                id: session.user.id,
                email: session.user.email!,
                full_name: session.user.user_metadata?.full_name,
                gender: session.user.user_metadata?.gender
            } : null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    const resetPassword = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin,
        });
        if (error) throw error;
    };

    const verifyPassword = async (password: string) => {
        if (!user || !user.email) throw new Error("User email not found");

        const { error } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: password
        });

        if (error) throw error;
    };

    const updateProfile = async (updates: { full_name?: string; gender?: string }) => {
        const { data, error } = await supabase.auth.updateUser({
            data: updates
        });
        if (error) throw error;

        // Manual update of local state to reflect change immediately
        if (data.user) {
            setUser(prev => prev ? {
                ...prev,
                full_name: updates.full_name || prev.full_name,
                gender: updates.gender || prev.gender
            } : null);
        }
    };

    const updateEmail = async (email: string) => {
        const { error } = await supabase.auth.updateUser({
            email: email
        });
        if (error) throw error;
    };

    const updatePassword = async (password: string) => {
        const { error } = await supabase.auth.updateUser({
            password: password
        });
        if (error) throw error;
    };

    const deleteAccount = async () => {
        if (!user) throw new Error('Not authenticated');

        // 1. Delete all user data
        // Order matters for FK constraints
        const { error: logsError } = await supabase.from('habit_logs').delete().eq('user_id', user.id);
        if (logsError) throw logsError;

        const { error: tasksError } = await supabase.from('tasks').delete().eq('user_id', user.id);
        // Tolerate task error if table doesn't exist yet
        if (tasksError && tasksError.code !== '42P01') console.error('Error deleting tasks:', tasksError);

        const { error: habitsError } = await supabase.from('habits').delete().eq('user_id', user.id);
        if (habitsError) throw habitsError;

        // 2. Sign Out
        await signOut();
    };

    const value = useMemo(() => ({
        user,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        verifyPassword,
        updateProfile,
        updateEmail,
        updatePassword,
        deleteAccount
    }), [user, loading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
