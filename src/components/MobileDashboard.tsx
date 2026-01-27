import React, { useState } from 'react';
import { BottomNav, TabType } from './BottomNav';
import { AddHabitModal } from './AddHabitModal';
import { TrackScreen } from '../screens/TrackScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { Habit } from '../types';

import { useHabits } from '../context/HabitContext';

export function MobileDashboard() {
    const { currentMonth, setCurrentMonth } = useHabits();
    const [activeTab, setActiveTab] = useState<TabType>('track');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

    const handleAddHabit = () => {
        setEditingHabit(null);
        setIsAddHabitModalOpen(true);
    };

    const handleEditHabit = (habit: Habit) => {
        setEditingHabit(habit);
        setIsAddHabitModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddHabitModalOpen(false);
        setEditingHabit(null);
    };

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
        setCurrentMonth(date);
    };

    return (
        <div className="min-h-screen" style={{ background: '#FFF8E7' }}>
            {/* Main Content */}
            <div className="pb-safe">
                {activeTab === 'track' && (
                    <TrackScreen
                        selectedDate={selectedDate}
                        onDateChange={handleDateChange}
                        onEditHabit={handleEditHabit}
                        onAddHabit={handleAddHabit}
                    />
                )}
                {activeTab === 'stats' && (
                    <InsightsScreen currentMonth={currentMonth} />
                )}
                {activeTab === 'profile' && (
                    <ProfileScreen />
                )}
            </div>

            {/* Bottom Navigation */}
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Add/Edit Habit Modal */}
            <AddHabitModal
                isOpen={isAddHabitModalOpen}
                onClose={handleCloseModal}
                initialHabit={editingHabit}
            />
        </div>
    );
}
