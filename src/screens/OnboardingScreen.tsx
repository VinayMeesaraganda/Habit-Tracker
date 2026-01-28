
import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { useHaptic } from '../utils/HapticUtils';

interface OnboardingScreenProps {
    onComplete: () => void;
}

const GOALS = [
    {
        id: 'health',
        emoji: '❤️',
        title: 'Better Health',
        habits: [
            { name: 'Drink Water', goal: 2000, unit: 'ml', type: 'health' },
            { name: 'Morning Walk', goal: 30, unit: 'minutes', type: 'fitness' },
            { name: 'Eat Vegetables', goal: 1, unit: 'serving', type: 'health' }
        ]
    },
    {
        id: 'productivity',
        emoji: '🚀',
        title: 'Boost Productivity',
        habits: [
            { name: 'Deep Work', goal: 60, unit: 'minutes', type: 'productivity' },
            { name: 'Plan Tomorrow', goal: 1, unit: 'session', type: 'productivity' },
            { name: 'Read Booking', goal: 10, unit: 'pages', type: 'learning' }
        ]
    },
    {
        id: 'mindfulness',
        emoji: '🧘',
        title: 'Mindfulness',
        habits: [
            { name: 'Meditation', goal: 10, unit: 'minutes', type: 'mindfulness' },
            { name: 'Gratitude Journal', goal: 1, unit: 'entry', type: 'mindfulness' },
            { name: 'Digital Detox', goal: 60, unit: 'minutes', type: 'health' }
        ]
    }
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0); // 0: Welcome, 1: Goal, 2: Habits
    const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
    const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
    const { addHabit } = useHabits();
    const { triggerLight, triggerSuccess } = useHaptic();

    const handleGoalSelect = (goalId: string) => {
        triggerLight();
        setSelectedGoal(goalId);
        // Pre-select all habits for this goal
        const goal = GOALS.find(g => g.id === goalId);
        if (goal) {
            setSelectedHabits(goal.habits.map(h => h.name));
        }
        setTimeout(() => setStep(2), 300);
    };

    const toggleHabit = (habitName: string) => {
        triggerLight();
        if (selectedHabits.includes(habitName)) {
            setSelectedHabits(selectedHabits.filter(h => h !== habitName));
        } else {
            setSelectedHabits([...selectedHabits, habitName]);
        }
    };

    const finishOnboarding = async () => {
        triggerSuccess();
        // Add selected habits
        const goal = GOALS.find(g => g.id === selectedGoal);
        if (goal) {
            const habitsToAdd = goal.habits.filter(h => selectedHabits.includes(h.name));
            for (const h of habitsToAdd) {
                await addHabit({
                    name: h.name,
                    category: 'Health', // Simplified for onboarding
                    type: 'daily',
                    is_quantifiable: true,
                    target_value: h.goal,
                    unit: h.unit,
                    created_at: new Date().toISOString(),
                    month_goal: 30, // Default
                    frequency: { type: 'daily' }
                });
            }
        }
        localStorage.setItem('has_onboarded', 'true');
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#FFF9E6] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            {step === 0 && (
                <div className="space-y-6 max-w-sm">
                    <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-fab animate-scale-in">
                        <Sparkles className="w-10 h-10 text-orange-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#1F1F1F]">Welcome to Itera</h1>
                    <p className="text-lg text-gray-500">
                        The premium habit tracker built for consistency and focus.
                    </p>
                    <button
                        onClick={() => { triggerLight(); setStep(1); }}
                        className="w-full py-4 rounded-2xl bg-[#1F1F1F] text-white font-bold text-lg shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                    >
                        Get Started <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            )}

            {step === 1 && (
                <div className="space-y-6 w-full max-w-sm animate-slide-up">
                    <h2 className="text-2xl font-bold text-[#1F1F1F] mb-2">What's your main focus?</h2>
                    <p className="text-gray-500 mb-8">We'll personalize your experience.</p>

                    <div className="space-y-3">
                        {GOALS.map(goal => (
                            <button
                                key={goal.id}
                                onClick={() => handleGoalSelect(goal.id)}
                                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-orange-200 hover:bg-orange-50 transition-all text-left group"
                            >
                                <span className="text-3xl">{goal.emoji}</span>
                                <div>
                                    <span className="block font-bold text-gray-800 group-hover:text-orange-900">{goal.title}</span>
                                    <span className="text-xs text-gray-400">Includes {goal.habits.length} starter habits</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {step === 2 && selectedGoal && (
                <div className="space-y-6 w-full max-w-sm animate-slide-up flex flex-col h-full py-10">
                    <div>
                        <h2 className="text-2xl font-bold text-[#1F1F1F]">Pick your habits</h2>
                        <p className="text-gray-500">Select the ones you want to track.</p>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto py-4">
                        {GOALS.find(g => g.id === selectedGoal)?.habits.map(habit => (
                            <button
                                key={habit.name}
                                onClick={() => toggleHabit(habit.name)}
                                className={`
                                    w-full flex items-center justify-between p-4 rounded-2xl border transition-all
                                    ${selectedHabits.includes(habit.name)
                                        ? 'bg-white border-orange-500 shadow-md scale-[1.02]'
                                        : 'bg-gray-50 border-transparent opacity-70'}
                                `}
                            >
                                <div className="text-left">
                                    <span className="block font-bold text-gray-800">{habit.name}</span>
                                    <span className="text-xs text-gray-500">{habit.goal} {habit.unit} / day</span>
                                </div>
                                <div className={`
                                    w-6 h-6 rounded-full border-2 flex items-center justify-center
                                    ${selectedHabits.includes(habit.name) ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}
                                `}>
                                    {selectedHabits.includes(habit.name) && <Check className="w-4 h-4 text-white" />}
                                </div>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={finishOnboarding}
                        disabled={selectedHabits.length === 0}
                        className="w-full py-4 rounded-2xl bg-[#1F1F1F] text-white font-bold text-lg shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        Start Tracking ({selectedHabits.length})
                    </button>
                </div>
            )}
        </div>
    );
};
