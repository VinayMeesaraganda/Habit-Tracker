import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Brain, Volume2, Settings, X, CheckCircle } from 'lucide-react';
import { useFocusTimer, PRESETS, TimerMode, TimerPreset } from '../context/FocusContext';

export const FocusTrackerScreen: React.FC = () => {
    const {
        mode,
        selectedPreset,
        timeLeft,
        isRunning,
        completedSessions,
        todayFocusTime,
        audioEnabled,
        setMode,
        setSelectedPreset,
        setCustomFocus,
        toggleTimer,
        resetTimer,
        toggleAudio,
        skipSession
    } = useFocusTimer();

    const [showSettings, setShowSettings] = useState(false);
    const [customTime, setCustomTime] = useState<string>('');

    const handleCustomTimeSubmit = () => {
        const minutes = parseInt(customTime);
        if (!isNaN(minutes) && minutes > 0) {
            setCustomFocus(minutes);
            setShowSettings(false);
            setCustomTime('');
        }
    };

    // Format time as MM:SS
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate progress for ring
    const getCurrentDuration = () => {
        switch (mode) {
            case 'focus': return selectedPreset.focus * 60;
            case 'shortBreak': return selectedPreset.shortBreak * 60;
            case 'longBreak': return selectedPreset.longBreak * 60;
        }
    };

    const calculateProgress = (): number => {
        const total = getCurrentDuration();
        return total > 0 ? ((total - timeLeft) / total) * 100 : 0;
    };

    // Circular progress calculation
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const progress = calculateProgress();
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    // Get colors based on mode
    const getModeColors = () => {
        switch (mode) {
            case 'focus':
                return {
                    primary: '#FF7A6B',
                    secondary: '#FFA094',
                    bg: 'linear-gradient(135deg, #FF7A6B 0%, #FFA094 100%)',
                    card: 'bg-gradient-to-br from-orange-50 to-red-50',
                    icon: 'text-orange-500',
                };
            case 'shortBreak':
                return {
                    primary: '#5BA3F5',
                    secondary: '#7DB8F7',
                    bg: 'linear-gradient(135deg, #5BA3F5 0%, #7DB8F7 100%)',
                    card: 'bg-gradient-to-br from-blue-50 to-cyan-50',
                    icon: 'text-blue-500',
                };
            case 'longBreak':
                return {
                    primary: '#9B6CF9',
                    secondary: '#B88FFA',
                    bg: 'linear-gradient(135deg, #9B6CF9 0%, #B88FFA 100%)',
                    card: 'bg-gradient-to-br from-purple-50 to-violet-50',
                    icon: 'text-purple-500',
                };
        }
    };

    const colors = getModeColors();

    const handleStartPause = () => {
        toggleTimer();
    };

    const handleReset = () => {
        resetTimer();
    };

    const handlePresetChange = (preset: TimerPreset) => {
        setSelectedPreset(preset);
    };

    const handleModeChange = (newMode: TimerMode) => {
        setMode(newMode);
    };

    // Derived state for completion modal
    // In Context, when timer hits 0, isRunning becomes false.
    // So if !isRunning and timeLeft === 0, we show completion.
    const showCompletion = !isRunning && timeLeft === 0;

    return (
        <div className="min-h-screen" style={{ background: '#FFF8E7' }}>
            {/* Main Layout Container */}
            <div className="max-w-6xl mx-auto w-full px-4 pt-4 lg:pt-12 lg:px-8">
                {/* Header - Desktop specific position */}
                <div className="flex items-center justify-between mb-6 lg:mb-12">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Focus Time
                    </h1>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-sm border border-gray-100 transition-all hover:bg-gray-50 active:scale-95"
                    >
                        <Settings className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-semibold text-gray-700">Change Time</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start lg:items-center">
                    {/* Left Column: Timer & Controls */}
                    <div className="flex flex-col items-center justify-center order-2 lg:order-1">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="relative mb-6 lg:mb-12"
                        >
                            {/* Progress Ring */}
                            <svg width="240" height="240" className="transform -rotate-90 lg:w-[360px] lg:h-[360px]">
                                <defs>
                                    <linearGradient id={`timerGradient-${mode}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor={colors.primary} />
                                        <stop offset="100%" stopColor={colors.secondary} />
                                    </linearGradient>
                                    <filter id="timerGlow">
                                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                {/* Background ring */}
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r={radius}
                                    fill="none"
                                    stroke="#F0F0F0"
                                    strokeWidth="12"
                                    className="lg:r-[160]"
                                />

                                {/* Progress ring */}
                                <motion.circle
                                    cx="50%"
                                    cy="50%"
                                    r={radius}
                                    fill="none"
                                    stroke={`url(#timerGradient-${mode})`}
                                    strokeWidth="12"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    initial={{ strokeDashoffset: circumference }}
                                    animate={{ strokeDashoffset }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    style={{ filter: isRunning ? 'url(#timerGlow)' : 'none' }}
                                />
                            </svg>

                            {/* Time Display */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <motion.span
                                    key={timeLeft}
                                    initial={{ opacity: 0.5, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="text-6xl lg:text-8xl font-black text-gray-900 tracking-tight"
                                >
                                    {formatTime(timeLeft)}
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-sm lg:text-lg text-gray-500 font-medium mt-2 lg:mt-4"
                                >
                                    {isRunning ? 'Time to focus' : 'Ready to start'}
                                </motion.span>
                            </div>
                        </motion.div>

                        {/* Control Buttons */}
                        <div className="flex items-center gap-6 lg:gap-8 mb-8">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleReset}
                                className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center"
                            >
                                <RotateCcw className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleStartPause}
                                className="w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center shadow-xl"
                                style={{ background: colors.bg }}
                            >
                                {isRunning ? (
                                    <Pause className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                                ) : (
                                    <Play className="w-8 h-8 lg:w-10 lg:h-10 text-white ml-1" />
                                )}
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={toggleAudio}
                                className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center"
                            >
                                <Volume2 className={`w-5 h-5 lg:w-6 lg:h-6 ${audioEnabled ? 'text-gray-700' : 'text-gray-300'}`} />
                            </motion.button>
                        </div>
                    </div>

                    {/* Right Column: Stats & Mode */}
                    <div className="order-1 lg:order-2 space-y-6 lg:max-w-md w-full mx-auto">
                        {/* Mode Tabs */}
                        <div className="flex gap-2">
                            {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => handleModeChange(m)}
                                    className={`flex-1 py-3 lg:py-4 rounded-xl font-semibold text-sm lg:text-base transition-all ${mode === m
                                        ? mode === 'focus'
                                            ? 'bg-orange-500 text-white shadow-lg'
                                            : mode === 'shortBreak'
                                                ? 'bg-blue-500 text-white shadow-lg'
                                                : 'bg-purple-500 text-white shadow-lg'
                                        : 'bg-white text-gray-500 border border-gray-100'
                                        }`}
                                >
                                    {m === 'focus' ? '🎯 Focus' : m === 'shortBreak' ? '☕ Short Break' : '😌 Long Break'}
                                </button>
                            ))}
                        </div>

                        {/* Today's Focus Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`rounded-3xl p-6 ${colors.card} border border-gray-100 shadow-sm`}
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center ${colors.icon}`}>
                                    <Brain className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Today's Focus</p>
                                    <p className="text-3xl font-black text-gray-900">
                                        {Math.floor(todayFocusTime / 60)}h {todayFocusTime % 60}m
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white/50 rounded-2xl p-4 flex items-center justify-between">
                                <span className="text-gray-600 font-medium">Sessions Completed</span>
                                <span className="text-2xl font-black text-gray-900">{completedSessions}</span>
                            </div>
                        </motion.div>

                        {/* Session Progress */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-800">Session Progress</h3>
                                <span className="text-sm font-medium text-gray-500">
                                    {completedSessions % selectedPreset.sessionsBeforeLong} / {selectedPreset.sessionsBeforeLong}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                {Array.from({ length: selectedPreset.sessionsBeforeLong }).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2 + i * 0.1 }}
                                        className={`flex-1 h-3 rounded-full ${i < (completedSessions % selectedPreset.sessionsBeforeLong) ||
                                            (completedSessions > 0 && completedSessions % selectedPreset.sessionsBeforeLong === 0 && i < selectedPreset.sessionsBeforeLong)
                                            ? 'bg-gradient-to-r from-orange-400 to-pink-500'
                                            : 'bg-gray-100'
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-3 text-center">
                                Complete {selectedPreset.sessionsBeforeLong} sessions for a long break
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* Settings Modal */}
                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowSettings(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                    <h2 className="text-lg font-bold text-gray-800">Timer Presets</h2>
                                    <button
                                        onClick={() => setShowSettings(false)}
                                        className="p-2 rounded-full hover:bg-gray-100"
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>
                                <div className="p-4 space-y-3">
                                    {PRESETS.map((preset) => (
                                        <button
                                            key={preset.name}
                                            onClick={() => handlePresetChange(preset)}
                                            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedPreset.name === preset.name
                                                ? 'border-orange-500 bg-orange-50'
                                                : 'border-gray-100 hover:border-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-gray-800">{preset.name}</span>
                                                {selectedPreset.name === preset.name && (
                                                    <CheckCircle className="w-5 h-5 text-orange-500" />
                                                )}
                                            </div>
                                            <div className="flex gap-4 text-sm text-gray-500">
                                                <span>🎯 {preset.focus}m</span>
                                                <span>☕ {preset.shortBreak}m</span>
                                                <span>😌 {preset.longBreak}m</span>
                                            </div>
                                        </button>
                                    ))}

                                    {/* Custom Time Input */}
                                    <div className="pt-4 mt-4 border-t border-gray-100">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Custom Duration (minutes)
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                value={customTime}
                                                onChange={(e) => setCustomTime(e.target.value)}
                                                placeholder="e.g. 50"
                                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            />
                                            <button
                                                onClick={handleCustomTimeSubmit}
                                                disabled={!customTime}
                                                className="px-6 py-3 rounded-xl bg-gray-900 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Set
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Completion Celebration */}
                <AnimatePresence>
                    {showCompletion && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="text-center"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.5, repeat: 2 }}
                                    className="text-6xl mb-4"
                                >
                                    {mode === 'focus' ? '🎉' : '☕'}
                                </motion.div>
                                <h2 className="text-2xl font-black text-white mb-2">
                                    {mode === 'focus' ? 'Focus Session Complete!' : 'Break Over!'}
                                </h2>
                                <p className="text-white/80 mb-6">
                                    {mode === 'focus'
                                        ? 'Great work! Take a well-deserved break.'
                                        : 'Ready to focus again?'
                                    }
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        skipSession();
                                    }}
                                    className="px-8 py-3 rounded-xl font-bold text-white shadow-lg"
                                    style={{
                                        background: mode === 'focus'
                                            ? 'linear-gradient(135deg, #5BA3F5 0%, #7DB8F7 100%)'
                                            : 'linear-gradient(135deg, #FF7A6B 0%, #FFA094 100%)'
                                    }}
                                >
                                    {mode === 'focus' ? 'Start Break' : 'Start Focus'}
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom padding */}
                <div className="h-24 lg:hidden" />
            </div>
        </div>
    );
};
