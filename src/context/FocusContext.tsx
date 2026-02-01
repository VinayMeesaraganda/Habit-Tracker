import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';

import { SoundManager } from '../utils/soundUtils';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface TimerPreset {
    name: string;
    focus: number;      // minutes
    shortBreak: number; // minutes
    longBreak: number;  // minutes
    sessionsBeforeLong: number;
}

export const PRESETS: TimerPreset[] = [
    { name: 'Classic Pomodoro', focus: 25, shortBreak: 5, longBreak: 15, sessionsBeforeLong: 4 },
    { name: 'Focus Flow', focus: 45, shortBreak: 10, longBreak: 30, sessionsBeforeLong: 2 },
    { name: 'Quick Sprints', focus: 15, shortBreak: 3, longBreak: 10, sessionsBeforeLong: 4 },
    { name: 'Deep Work', focus: 60, shortBreak: 10, longBreak: 20, sessionsBeforeLong: 2 },
];

interface FocusContextType {
    mode: TimerMode;
    selectedPreset: TimerPreset;
    timeLeft: number;
    isRunning: boolean;
    completedSessions: number;
    todayFocusTime: number; // in minutes
    audioEnabled: boolean;
    setMode: (mode: TimerMode) => void;
    setSelectedPreset: (preset: TimerPreset) => void;
    setCustomFocus: (minutes: number) => void;
    toggleTimer: () => void;
    resetTimer: () => void;
    toggleAudio: () => void;
    skipSession: () => void; // Manually move to next phase
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export function FocusProvider({ children }: { children: ReactNode }) {
    const [selectedPreset, setSelectedPreset] = useState<TimerPreset>(PRESETS[0]);
    const [mode, setMode] = useState<TimerMode>('focus');
    const [isRunning, setIsRunning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(selectedPreset.focus * 60);
    const [completedSessions, setCompletedSessions] = useState(() => {
        const saved = localStorage.getItem('focus_completedSessions');
        const savedDate = localStorage.getItem('focus_todayDate');
        const today = new Date().toDateString();

        if (savedDate !== today) {
            return 0;
        }
        return saved ? parseInt(saved, 10) : 0;
    });
    const [todayFocusTime, setTodayFocusTime] = useState(() => {
        // Reset daily at midnight logic could go here, for now simple persistence
        const saved = localStorage.getItem('focus_todayFocusTime');
        const savedDate = localStorage.getItem('focus_todayDate');
        const today = new Date().toDateString();

        if (savedDate !== today) {
            return 0;
        }
        return saved ? parseInt(saved, 10) : 0;
    });
    const [audioEnabled, setAudioEnabled] = useState(true);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Persist stats
    useEffect(() => {
        localStorage.setItem('focus_completedSessions', completedSessions.toString());
    }, [completedSessions]);

    useEffect(() => {
        localStorage.setItem('focus_todayFocusTime', todayFocusTime.toString());
        localStorage.setItem('focus_todayDate', new Date().toDateString());
    }, [todayFocusTime]);

    // Get current timer duration based on mode
    const getCurrentDuration = useCallback(() => {
        switch (mode) {
            case 'focus': return selectedPreset.focus * 60;
            case 'shortBreak': return selectedPreset.shortBreak * 60;
            case 'longBreak': return selectedPreset.longBreak * 60;
        }
    }, [mode, selectedPreset]);

    // Timer Tick
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        // Timer Completed Logic
                        handleTimerComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, timeLeft]); // Dependencies are tricky with intervals, but timeLeft > 0 check handles completion

    const handleTimerComplete = () => {
        setIsRunning(false);
        if (mode === 'focus') {
            setTodayFocusTime(prev => prev + selectedPreset.focus);
            setCompletedSessions(prev => prev + 1);
            if (audioEnabled) SoundManager.playCompletion();

            // Note: We stay in 0 timeLeft state so UI can show "Complete!"
            // The Next button in UI will trigger transition
        } else {
            if (audioEnabled) SoundManager.playBreakComplete();
        }
    };

    // When mode or preset changes, reset timer
    // BUT be careful not to reset if we are just switching back to a running timer (not implemented yet, assumed manual swich resets)
    // Actually, we want explicit changes to reset.
    useEffect(() => {
        if (!isRunning && timeLeft === 0 && mode === 'focus') {
            // If we just finished a break, and switched to focus, ready up.
            setTimeLeft(selectedPreset.focus * 60);
        }
    }, [mode]);

    const toggleTimer = () => {
        // If finished (0), reset first? No, explicit action needed usually.
        // If 0 and user hits play, maybe restart current mode?
        if (timeLeft === 0) {
            setTimeLeft(getCurrentDuration());
            setIsRunning(true);
        } else {
            setIsRunning(!isRunning);
        }
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(getCurrentDuration());
    };

    const toggleAudio = () => setAudioEnabled(!audioEnabled);

    const changeMode = (newMode: TimerMode) => {
        setMode(newMode);
        setIsRunning(false);
        // Force calculation of new duration immediate
        let duration = 0;
        switch (newMode) {
            case 'focus': duration = selectedPreset.focus * 60; break;
            case 'shortBreak': duration = selectedPreset.shortBreak * 60; break;
            case 'longBreak': duration = selectedPreset.longBreak * 60; break;
        }
        setTimeLeft(duration);
    };

    const setPreset = (preset: TimerPreset) => {
        setSelectedPreset(preset);
        setMode('focus');
        setIsRunning(false);
        setTimeLeft(preset.focus * 60);
    };

    const skipSession = () => {
        // Logic to move to next session automatically or manually
        if (mode === 'focus') {
            if ((completedSessions + 1) % selectedPreset.sessionsBeforeLong === 0) {
                changeMode('longBreak');
            } else {
                changeMode('shortBreak');
            }
        } else {
            changeMode('focus');
        }
    };

    const setCustomFocus = (minutes: number) => {
        const customPreset: TimerPreset = {
            name: 'Custom',
            focus: minutes,
            shortBreak: 5, // Default
            longBreak: 15, // Default
            sessionsBeforeLong: 4 // Default
        };
        setSelectedPreset(customPreset);
        setMode('focus');
        setIsRunning(false);
        setTimeLeft(minutes * 60);
    };

    return (
        <FocusContext.Provider value={{
            mode,
            selectedPreset,
            timeLeft,
            isRunning,
            completedSessions,
            todayFocusTime,
            audioEnabled,
            setMode: changeMode,
            setSelectedPreset: setPreset,
            setCustomFocus,
            toggleTimer,
            resetTimer,
            toggleAudio,
            skipSession
        }}>
            {children}
        </FocusContext.Provider>
    );
}

export function useFocusTimer() {
    const context = useContext(FocusContext);
    if (context === undefined) {
        throw new Error('useFocusTimer must be used within a FocusProvider');
    }
    return context;
}
