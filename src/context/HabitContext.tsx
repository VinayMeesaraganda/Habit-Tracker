/**
 * HabitContext - Global state management with Supabase integration
 * Manages habits, logs, authentication, and real-time sync
 */

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Habit, HabitLog, User } from '../types';
import { startOfMonth, format, subMonths } from 'date-fns';

interface HabitContextType {
    // Auth state
    user: User | null;
    loading: boolean;

    // Data state
    habits: Habit[];
    logs: HabitLog[];
    currentMonth: Date;

    // Auth actions
    signUp: (email: string, password: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;

    resetPassword: (email: string) => Promise<void>;
    verifyPassword: (password: string) => Promise<void>;

    updateProfile: (name: string) => Promise<void>;
    updateEmail: (email: string) => Promise<void>;
    updatePassword: (password: string) => Promise<void>;

    // Data actions
    addHabit: (habit: Omit<Habit, 'id' | 'user_id' | 'updated_at'> & { created_at?: string }) => Promise<void>;
    updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
    deleteHabit: (id: string) => Promise<void>;

    toggleLog: (habitId: string, date: string) => Promise<void>;
    toggleHabit: (habitId: string, date: Date) => Promise<void>;
    getHabitLogs: (date: Date) => HabitLog[];

    setCurrentMonth: (date: Date) => void;
    refreshData: () => Promise<void>;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export function HabitProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [logs, setLogs] = useState<HabitLog[]>([]);
    const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));

    // Initialize auth state
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ? {
                id: session.user.id,
                email: session.user.email!,
                full_name: session.user.user_metadata?.full_name
            } : null);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ? {
                id: session.user.id,
                email: session.user.email!,
                full_name: session.user.user_metadata?.full_name
            } : null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Load habits and logs when user changes
    useEffect(() => {
        if (user) {
            refreshData();
        } else {
            setHabits([]);
            setLogs([]);
        }
    }, [user]);

    // Set up real-time subscriptions
    useEffect(() => {
        if (!user) return;

        const habitsSubscription = supabase
            .channel('habits_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'habits',
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    refreshData();
                }
            )
            .subscribe();

        const logsSubscription = supabase
            .channel('logs_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'habit_logs',
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    refreshData();
                }
            )
            .subscribe();

        return () => {
            habitsSubscription.unsubscribe();
            logsSubscription.unsubscribe();
        };
    }, [user]);

    const refreshData = async () => {
        if (!user) return;

        try {
            const [habitsResponse, logsResponse] = await Promise.all([
                supabase
                    .from('habits')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('priority', { ascending: true }), // Sort by priority
                supabase
                    .from('habit_logs')
                    .select('*')
                    .gte('date', format(startOfMonth(subMonths(currentMonth, 1)), 'yyyy-MM-dd'))
                    .eq('user_id', user.id)
            ]);

            if (habitsResponse.error) throw habitsResponse.error;
            if (logsResponse.error) throw logsResponse.error;

            setHabits(habitsResponse.data || []);
            setLogs(logsResponse.data || []);
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    };

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

    const updateProfile = async (name: string) => {
        const { data, error } = await supabase.auth.updateUser({
            data: { full_name: name }
        });
        if (error) throw error;

        // Manual update of local state to reflect change immediately
        if (data.user) {
            setUser(prev => prev ? { ...prev, full_name: name } : null);
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

    const normalizePriorities = async () => {
        if (!user) return;

        // Fetch all habits to re-sequence them
        // Sort by Priority ASC.
        // Secondary Sort: Created_at DESC (Newest first).
        // If two habits have Priority 1, the NEW one (Latest created) stays at 1, the OLD one moves to 2.
        const { data: allHabits, error } = await supabase
            .from('habits')
            .select('*')
            .eq('user_id', user.id)
            .order('priority', { ascending: true })
            .order('created_at', { ascending: false });

        if (error || !allHabits) {
            console.error('Error normalizing priorities:', error);
            return;
        }

        const updates: Habit[] = [];
        allHabits.forEach((h, index) => {
            const expectedPriority = index + 1;
            if (h.priority !== expectedPriority) {
                updates.push({ ...h, priority: expectedPriority });
            }
        });

        if (updates.length > 0) {
            const { error: upsertError } = await supabase
                .from('habits')
                .upsert(updates);

            if (upsertError) console.error('Error updating priorities:', upsertError);
            // No need to call refreshData() here if we call it in the parent actions, 
            // but satisfying the safety check, we might want to ensure state is consistent.
            // However, the parent actions calls refreshData(). I'll let them handle it or do it here.
            // If we update here, local state is stale until refresh.
        }
    };

    const addHabit = async (habit: Omit<Habit, 'id' | 'user_id' | 'updated_at'> & { created_at?: string }) => {
        if (!user) throw new Error('User not authenticated');

        // Handle priority conflict if a priority is provided
        const { error } = await supabase.from('habits').insert({
            ...habit,
            user_id: user.id,
            created_at: habit.created_at || new Date().toISOString(), // Use provided date or now
        });

        if (error) throw error;
        await normalizePriorities();
        await refreshData();
    };

    const updateHabit = async (id: string, updates: Partial<Habit>) => {
        const { error } = await supabase
            .from('habits')
            .update(updates)
            .eq('id', id);

        if (error) throw error;

        // Normalize priorities if:
        // 1. Priority changed
        // 2. Habit is being archived (removed from active list)
        // 3. Habit is being resumed (added back to active list)
        if (updates.priority !== undefined || updates.archived_at !== undefined) {
            await normalizePriorities();
        }
        await refreshData();
    };

    const deleteHabit = async (id: string) => {
        const { error } = await supabase
            .from('habits')
            .delete()
            .eq('id', id);

        if (error) throw error;
        await normalizePriorities();
        await refreshData();
    };

    const toggleLog = async (habitId: string, date: string) => {
        if (!user) throw new Error('User not authenticated');

        // Optimistic Update
        const existingLogIndex = logs.findIndex(
            log => log.habit_id === habitId && log.date === date
        );

        let optimisticCompleted = true;

        if (existingLogIndex >= 0) {
            optimisticCompleted = !logs[existingLogIndex].completed;

            // Optimistically update existing
            setLogs(prev => {
                const newLogs = [...prev];
                newLogs[existingLogIndex] = { ...newLogs[existingLogIndex], completed: optimisticCompleted };
                return newLogs;
            });
        } else {
            // Optimistically add new
            const tempLog: HabitLog = {
                id: 'temp-' + Date.now(),
                user_id: user.id,
                habit_id: habitId,
                date,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                completed: true
            };
            setLogs(prev => [...prev, tempLog]);
        }

        try {
            // 1. Check if log exists in DB (Explicit check to avoid Unique Constraint dependency)
            const { data: existingDbLog } = await supabase
                .from('habit_logs')
                .select('id, completed')
                .eq('user_id', user.id)
                .eq('habit_id', habitId)
                .eq('date', date)
                .maybeSingle(); // Use maybeSingle to avoid error if not found

            let finalData: HabitLog | null = null;

            if (existingDbLog) {
                // 2. Update existing
                const { data, error } = await supabase
                    .from('habit_logs')
                    .update({ completed: optimisticCompleted })
                    .eq('id', existingDbLog.id)
                    .select()
                    .single();

                if (error) throw error;
                finalData = data;
            } else {
                // 3. Insert new
                const { data, error } = await supabase
                    .from('habit_logs')
                    .insert({
                        user_id: user.id,
                        habit_id: habitId,
                        date,
                        completed: optimisticCompleted,
                    })
                    .select()
                    .single();

                if (error) throw error;
                finalData = data;
            }

            // 4. Update local state with real data to replace optimistic/temp data
            if (finalData) {
                setLogs(prev => {
                    const idx = prev.findIndex(l => l.habit_id === habitId && l.date === date);
                    if (idx >= 0) {
                        const newLogs = [...prev];
                        newLogs[idx] = finalData!;
                        return newLogs;
                    }
                    return [...prev, finalData!];
                });
            }

        } catch (error) {
            console.error("Toggle log failed:", error);
            // Revert optimistic update on critical failure
            await refreshData();
            throw error;
        }
    };

    const toggleHabit = async (habitId: string, date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        await toggleLog(habitId, dateStr);
    };

    const getHabitLogs = useCallback((date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return logs.filter(log => log.date === dateStr);
    }, [logs]);

    const value: HabitContextType = useMemo(() => ({
        user,
        loading,
        habits,
        logs,
        currentMonth,
        signUp,
        signIn,
        signOut,
        resetPassword,
        verifyPassword,
        updateProfile,
        updateEmail,
        updatePassword,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleLog,
        toggleHabit,
        getHabitLogs,
        setCurrentMonth,
        refreshData,
    }), [user, loading, habits, logs, currentMonth, getHabitLogs]);

    return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}

export function useHabits() {
    const context = useContext(HabitContext);
    if (context === undefined) {
        throw new Error('useHabits must be used within a HabitProvider');
    }
    return context;
}
