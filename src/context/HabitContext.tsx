/**
 * HabitContext - Global state management with Supabase integration
 * Manages habits, logs, authentication, and real-time sync
 */

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Habit, HabitLog, User } from '../types';
import { startOfMonth, format } from 'date-fns';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

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
    deleteAccount: () => Promise<void>;

    resetPassword: (email: string) => Promise<void>;
    verifyPassword: (password: string) => Promise<void>;

    updateProfile: (updates: { full_name?: string; gender?: string }) => Promise<void>;
    updateEmail: (email: string) => Promise<void>;
    updatePassword: (password: string) => Promise<void>;

    // Data actions
    // Data actions
    addHabit: (habit: Omit<Habit, 'id' | 'user_id' | 'updated_at'> & { created_at?: string }) => Promise<void>;
    updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
    deleteHabit: (id: string) => Promise<void>;

    toggleLog: (habitId: string, date: string) => Promise<void>;
    toggleHabit: (habitId: string, date: Date) => Promise<void>;
    toggleSkipDay: (habitId: string, date: string) => Promise<void>;
    addLogWithValue: (habitId: string, date: string, value: number) => Promise<void>;
    updateLogValue: (habitId: string, date: string, newValue: number) => Promise<void>;
    getHabitLogs: (date: Date) => HabitLog[];
    getHabitLogsForDate: (habitId: string, date: string) => HabitLog[];
    isSkipped: (habitId: string, date: string) => boolean;

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

    // Race condition prevention: Track if a local operation is in-flight
    const operationInFlightRef = useRef(false);
    const refreshDebounceRef = useRef<NodeJS.Timeout | null>(null);

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

    // Load habits and logs when user changes
    useEffect(() => {
        if (user) {
            refreshData();
        } else {
            setHabits([]);
            setLogs([]);
        }
    }, [user]);

    // Set up real-time subscriptions with debouncing to prevent race conditions
    useEffect(() => {
        if (!user) return;

        // Debounced refresh handler - prevents rapid-fire updates from racing with local state
        const debouncedRefresh = () => {
            // Skip if a local operation is in progress
            if (operationInFlightRef.current) {
                console.log('[Realtime] Skipping refresh - operation in flight');
                return;
            }

            // Clear any pending debounce
            if (refreshDebounceRef.current) {
                clearTimeout(refreshDebounceRef.current);
            }

            // Debounce the refresh by 300ms to batch rapid-fire events
            refreshDebounceRef.current = setTimeout(() => {
                console.log('[Realtime] Executing debounced refresh');
                refreshData();
            }, 300);
        };

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
                debouncedRefresh
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
                debouncedRefresh
            )
            .subscribe();

        return () => {
            if (refreshDebounceRef.current) {
                clearTimeout(refreshDebounceRef.current);
            }
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

        // Mark operation as in-flight to prevent realtime refresh conflicts
        operationInFlightRef.current = true;

        // Haptic Feedback (Native Polish)
        try {
            await Haptics.impact({ style: ImpactStyle.Light });
        } catch (e) {
            // Ignore error on web
        }

        // Check if log exists locally
        const existingLogIndex = logs.findIndex(
            log => log.habit_id === habitId && log.date === date
        );

        const isCurrentlyCompleted = existingLogIndex >= 0;

        // Optimistic Update
        if (isCurrentlyCompleted) {
            // Remove from local state (uncompleting)
            setLogs(prev => prev.filter(l => !(l.habit_id === habitId && l.date === date)));
        } else {
            // Add to local state (completing)
            const tempLog: HabitLog = {
                id: 'temp-' + Date.now(),
                user_id: user.id,
                habit_id: habitId,
                date,
            };
            setLogs(prev => [...prev, tempLog]);
        }

        try {
            // Check if log exists in DB
            const { data: existingDbLog } = await supabase
                .from('habit_logs')
                .select('id')
                .eq('user_id', user.id)
                .eq('habit_id', habitId)
                .eq('date', date)
                .maybeSingle();

            if (existingDbLog) {
                // Log exists → User is uncompleting → DELETE
                const { error } = await supabase
                    .from('habit_logs')
                    .delete()
                    .eq('id', existingDbLog.id);

                if (error) throw error;

                // Update local state to remove the log
                setLogs(prev => prev.filter(l => l.id !== existingDbLog.id));
            } else {
                // Log doesn't exist → User is completing → INSERT
                const { data, error } = await supabase
                    .from('habit_logs')
                    .insert({
                        user_id: user.id,
                        habit_id: habitId,
                        date,
                    })
                    .select()
                    .single();

                if (error) throw error;

                // Update local state with real data (replace temp)
                setLogs(prev => {
                    const filtered = prev.filter(l => !(l.habit_id === habitId && l.date === date));
                    return [...filtered, data];
                });
            }

        } catch (error) {
            console.error("Toggle log failed:", error);
            // Revert optimistic update on failure
            await refreshData();
            throw error;
        } finally {
            // Always release the in-flight lock
            operationInFlightRef.current = false;
        }
    };

    const toggleHabit = async (habitId: string, date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        await toggleLog(habitId, dateStr);
    };

    const getHabitLogs = useCallback((date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        // All logs in the array are completed (completion-only storage)
        return logs.filter(log => log.date === dateStr);
    }, [logs]);

    // Check if a specific date is skipped for a habit
    const isSkipped = useCallback((habitId: string, date: string): boolean => {
        const habit = habits.find(h => h.id === habitId);
        if (!habit || !habit.skip_dates) return false;
        return habit.skip_dates.includes(date);
    }, [habits]);

    // Toggle skip status for a specific date
    const toggleSkipDay = async (habitId: string, date: string) => {
        const habit = habits.find(h => h.id === habitId);
        if (!habit) throw new Error('Habit not found');

        const currentSkips = habit.skip_dates || [];
        let newSkips: string[];

        if (currentSkips.includes(date)) {
            // Remove from skip list
            newSkips = currentSkips.filter(d => d !== date);
        } else {
            // Add to skip list
            newSkips = [...currentSkips, date];
        }

        await updateHabit(habitId, { skip_dates: newSkips });
    };

    // Get logs for a specific habit on a specific date
    const getHabitLogsForDate = useCallback((habitId: string, date: string): HabitLog[] => {
        return logs.filter(log => log.habit_id === habitId && log.date === date);
    }, [logs]);

    // Add a log with a specific value (for quantifiable habits)
    const addLogWithValue = async (habitId: string, date: string, value: number) => {
        if (!user) {
            console.error('addLogWithValue: Not authenticated');
            return;
        }

        // Mark operation as in-flight to prevent realtime refresh conflicts
        operationInFlightRef.current = true;

        // Haptic Feedback
        try {
            await Haptics.impact({ style: ImpactStyle.Light });
        } catch (e) { /* Ignore */ }

        // Check if there's already a log for this habit on this date
        const existingLog = logs.find(
            log => log.habit_id === habitId && log.date === date
        );

        // Optimistic Update - update UI immediately
        if (existingLog) {
            const newValue = (existingLog.value || 0) + value;
            setLogs(prev => prev.map(log =>
                log.id === existingLog.id
                    ? { ...log, value: newValue }
                    : log
            ));
        } else {
            const tempLog: HabitLog = {
                id: 'temp-' + Date.now(),
                user_id: user.id,
                habit_id: habitId,
                date,
                value,
            };
            setLogs(prev => [...prev, tempLog]);
        }

        try {
            if (existingLog) {
                // Update existing log by adding the new value
                const newValue = (existingLog.value || 0) + value;

                const { error } = await supabase
                    .from('habit_logs')
                    .update({ value: newValue })
                    .eq('id', existingLog.id);

                if (error) {
                    console.error('Update error:', error);
                    // Revert on error
                    await refreshData();
                    return;
                }

                // Sync with actual DB value (already optimistically set)
            } else {
                // Create new log
                const { data, error } = await supabase
                    .from('habit_logs')
                    .insert({
                        user_id: user.id,
                        habit_id: habitId,
                        date: date,
                        value: value
                    })
                    .select()
                    .single();

                if (error) {
                    console.error('Insert error:', error);
                    // Revert on error
                    await refreshData();
                    return;
                }

                // Replace temp with real data
                if (data) {
                    setLogs(prev => {
                        const filtered = prev.filter(l => !(l.habit_id === habitId && l.date === date && l.id.startsWith('temp-')));
                        return [...filtered, data];
                    });
                }
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            await refreshData();
        } finally {
            // Always release the in-flight lock
            operationInFlightRef.current = false;
        }
    };

    // Update a log with a specific absolute value (overwrite)
    const updateLogValue = async (habitId: string, date: string, newValue: number) => {
        if (!user) {
            console.error('updateLogValue: Not authenticated');
            return;
        }

        console.log('updateLogValue called:', { habitId, date, newValue });

        const existingLog = logs.find(
            log => log.habit_id === habitId && log.date === date
        );

        try {
            if (existingLog) {
                // Update existing log
                const { error } = await supabase
                    .from('habit_logs')
                    .update({ value: newValue })
                    .eq('id', existingLog.id);

                if (error) {
                    console.error('Update error:', error);
                    alert('Backend error (update): ' + error.message);
                    return;
                }

                // Update local state
                setLogs(prev => prev.map(log =>
                    log.id === existingLog.id
                        ? { ...log, value: newValue }
                        : log
                ));
            } else {
                // Create new log with this value
                const { data, error } = await supabase
                    .from('habit_logs')
                    .insert({
                        user_id: user.id,
                        habit_id: habitId,
                        date: date,
                        value: newValue
                    })
                    .select()
                    .single();

                if (error) {
                    console.error('Insert error:', error);
                    alert('Backend error (insert): ' + error.message);
                    return;
                }

                if (data) {
                    setLogs(prev => [...prev, data]);
                }
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            alert('Unexpected error: ' + String(err));
        }
    };

    const deleteAccount = async () => {
        if (!user) throw new Error('Not authenticated');

        // 1. Delete all user data
        // Order matters if there are foreign key constraints (logs depend on habits)
        const { error: logsError } = await supabase.from('habit_logs').delete().eq('user_id', user.id);
        if (logsError) throw logsError;

        const { error: tasksError } = await supabase.from('tasks').delete().eq('user_id', user.id);
        // Tolerate task error if table doesn't exist yet, but log it
        if (tasksError && tasksError.code !== '42P01') console.error('Error deleting tasks:', tasksError);

        const { error: habitsError } = await supabase.from('habits').delete().eq('user_id', user.id);
        if (habitsError) throw habitsError;

        // 2. Sign Out
        await signOut();
    };

    const value: HabitContextType = useMemo(() => ({
        user,
        loading,
        habits,
        logs,
        currentMonth,
        signUp,
        signIn,
        signOut,
        deleteAccount,
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
        toggleSkipDay,
        addLogWithValue,
        updateLogValue,
        getHabitLogs,
        getHabitLogsForDate,
        isSkipped,
        setCurrentMonth,
        refreshData,
    }), [user, loading, habits, logs, currentMonth, getHabitLogs, getHabitLogsForDate, isSkipped]);

    return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}

export function useHabits() {
    const context = useContext(HabitContext);
    if (context === undefined) {
        throw new Error('useHabits must be used within a HabitProvider');
    }
    return context;
}
