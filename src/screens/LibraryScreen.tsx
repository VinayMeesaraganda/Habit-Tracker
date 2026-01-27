import React, { useMemo, useState, useCallback } from 'react';
import { useHabits } from '../context/HabitContext';
import { SectionDivider, ColorfulHabitCard } from '../components/ui';
import { calculateStreak } from '../utils/analytics';
import { getHabitMonthlyProgress } from '../utils/habitProgress';
import { getCategoryEmoji } from '../utils/categoryEmojis';
import { Habit } from '../types';
import { Edit2, Archive, Trash2 } from 'lucide-react';

interface LibraryScreenProps {
    onAddHabit: () => void;
    onEditHabit?: (habit: Habit) => void;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({ onAddHabit, onEditHabit }) => {
    const { habits, logs, updateHabit, deleteHabit } = useHabits();
    const [searchQuery, setSearchQuery] = useState('');

    // Separate active and archived habits
    const { activeHabits, archivedHabits } = useMemo(() => {
        const active = habits.filter(h => !h.archived_at);
        const archived = habits.filter(h => h.archived_at);

        // Filter by search query
        const filterHabits = (habitList: typeof habits) => {
            if (!searchQuery) return habitList;
            return habitList.filter(h =>
                h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                h.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
        };

        return {
            activeHabits: filterHabits(active),
            archivedHabits: filterHabits(archived),
        };
    }, [habits, searchQuery]);

    // Get schedule text
    const getScheduleText = (habit: Habit) => {
        if (habit.type === 'daily') return 'Everyday';
        return 'Weekly';
    };

    const handleEdit = useCallback((habit: Habit) => {
        onEditHabit?.(habit);
    }, [onEditHabit]);

    const handleArchive = useCallback(async (habitId: string) => {
        if (window.confirm('Archive this habit?')) {
            await updateHabit(habitId, { archived_at: new Date().toISOString() });
        }
    }, [updateHabit]);

    const handleDelete = useCallback(async (habitId: string) => {
        if (window.confirm('Delete this habit permanently? This cannot be undone.')) {
            await deleteHabit(habitId);
        }
    }, [deleteHabit]);

    return (
        <div className="min-h-screen pb-24 px-4" style={{ background: '#FFF8E7' }}>
            {/* Header */}
            <div className="pt-8 pb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold" style={{ color: '#1F1F1F' }}>
                    Library
                </h1>
                <button
                    onClick={onAddHabit}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-light transition-all hover:scale-105 active:scale-95"
                    style={{
                        background: 'linear-gradient(135deg, #FF7A6B 0%, #FFA094 100%)',
                        color: '#FFFFFF',
                        boxShadow: '0 6px 20px rgba(255, 122, 107, 0.3)',
                    }}
                >
                    +
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search habits..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2"
                    style={{
                        background: '#FFFFFF',
                        border: '1px solid #E0E0E0',
                        color: '#1F1F1F',
                    }}
                />
            </div>

            {/* Active Habits */}
            <SectionDivider text={`ACTIVE (${activeHabits.length})`} />

            <div className="mb-8">
                {activeHabits.length === 0 ? (
                    <div className="text-center py-8">
                        <p style={{ color: '#6B6B6B' }}>
                            {searchQuery ? 'No habits found' : 'No active habits'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {activeHabits.map(habit => (
                            <div key={habit.id} className="relative">
                                <ColorfulHabitCard
                                    icon={getCategoryEmoji(habit.category)}
                                    name={habit.name}
                                    schedule={getScheduleText(habit)}
                                    completed={false}
                                    category={habit.category}
                                    onToggle={() => handleEdit(habit)}
                                />
                                {/* Quick Actions Overlay */}
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(habit);
                                        }}
                                        className="p-1.5 rounded-lg transition-all hover:scale-110"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.3)',
                                            backdropFilter: 'blur(10px)',
                                        }}
                                    >
                                        <Edit2 className="w-3.5 h-3.5 text-white" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Archived Habits */}
            {archivedHabits.length > 0 && (
                <>
                    <SectionDivider text={`ARCHIVED (${archivedHabits.length})`} />
                    <div className="space-y-3">
                        {archivedHabits.map(habit => (
                            <div
                                key={habit.id}
                                className="flex items-center gap-4 p-4 rounded-xl opacity-60"
                                style={{
                                    background: '#FFFFFF',
                                    border: '1px solid #F0F0F0',
                                }}
                            >
                                <span className="text-3xl flex-shrink-0">
                                    {getCategoryEmoji(habit.category)}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-medium truncate" style={{ color: '#1F1F1F' }}>
                                        {habit.name}
                                    </h3>
                                    <p className="text-sm" style={{ color: '#6B6B6B' }}>
                                        {habit.category} · {habit.type === 'daily' ? 'Daily' : 'Weekly'}
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    <button
                                        onClick={() => handleDelete(habit.id)}
                                        className="p-2 transition-colors rounded-lg hover:bg-red-50"
                                        style={{ color: '#FF5252' }}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
