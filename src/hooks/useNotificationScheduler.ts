import { useEffect, useRef } from 'react';
import { useHabits } from '../context/HabitContext';
import { format } from 'date-fns';
import { playNotificationSound } from '../utils/audio';

export function useNotificationScheduler() {
    const { habits } = useHabits();
    const lastCheckMinute = useRef<string | null>(null);

    useEffect(() => {
        // Check permission on mount
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            // Optional: Auto-request or wait for user action? 
            // Better to wait for user to enabled a reminder, but we check availability here.
        }

        const checkReminders = () => {
            const now = new Date();
            const currentTime = format(now, 'HH:mm');

            // Prevent double firing in the same minute
            if (lastCheckMinute.current === currentTime) return;
            lastCheckMinute.current = currentTime;

            // Find habits scheduled for this time
            const habitsToRemind = habits.filter(h =>
                h.reminder_time === currentTime &&
                !h.archived_at
                // potential TODO: Check if already completed today?
                // For now, simple reminder is fine. 
                // Advanced: && !isCompletedToday(h)
            );

            habitsToRemind.forEach(habit => {
                // Check Global Switch
                const isMuted = localStorage.getItem('notifications_muted') === 'true';
                if (isMuted) return;

                if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                    // Play sound
                    playNotificationSound();

                    new Notification(`Time for ${habit.name}! ⏰`, {
                        body: `Don't forget your daily goal!`,
                        icon: '/pwa-192x192.png',
                        tag: `reminder-${habit.id}-${currentTime}` // Prevent duplicates
                    });
                }
            });
        };

        // Check every 30 seconds to be sure we hit the minute
        const intervalId = setInterval(checkReminders, 30000);

        // Initial check
        checkReminders();

        return () => clearInterval(intervalId);
    }, [habits]);
}
