import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { startOfMonth, format } from 'date-fns';

interface MonthlyHabitStat {
    habit_id: string;
    completion_count: number;
}

interface UserOverview {
    total_habits: number;
    total_completions: number;
}

export function useAnalytics() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getMonthlyStats = useCallback(async (date: Date): Promise<MonthlyHabitStat[]> => {
        setLoading(true);
        setError(null);
        try {
            const startStr = format(startOfMonth(date), 'yyyy-MM-dd');

            const { data, error } = await supabase
                .rpc('get_monthly_habit_stats', { month_start: startStr });

            if (error) throw error;
            return data as MonthlyHabitStat[];
        } catch (err: any) {
            console.error('Error fetching monthly stats:', err);
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getUserOverview = useCallback(async (): Promise<UserOverview | null> => {
        setLoading(true);
        setError(null);
        try {
            // Note: rpc usually returns an array of rows or a scalar.
            // Our function returns a TABLE with 1 row.
            const { data, error } = await supabase
                .rpc('get_user_overview');

            if (error) throw error;

            if (data && data.length > 0) {
                return data[0] as UserOverview;
            }
            return null;
        } catch (err: any) {
            console.error('Error fetching user overview:', err);
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        getMonthlyStats,
        getUserOverview,
        loading,
        error
    };
}
