import { useMemo } from 'react';
import { startOfDay, isBefore, parseISO } from 'date-fns';
import { Habit } from '../types';

/**
 * Hook to filter habits based on creation and archive dates
 * Returns only habits that should be visible for the given date
 */
export const useVisibleHabits = (habits: Habit[], selectedDate: Date) => {
    return useMemo(() => {
        const selectedDay = startOfDay(selectedDate);

        return habits.filter(habit => {
            // Filter out habits that haven't been created yet
            if (habit.created_at) {
                const createdDay = startOfDay(parseISO(habit.created_at));
                if (isBefore(selectedDay, createdDay)) {
                    return false;
                }
            }

            // Filter out archived habits if selected date is after archive date
            if (habit.archived_at) {
                const archivedDay = startOfDay(parseISO(habit.archived_at));
                if (isBefore(archivedDay, selectedDay)) {
                    return false;
                }
            }

            return true;
        });
    }, [habits, selectedDate]);
};
