import { useState } from 'react';
import { BottomNav, TabType } from './BottomNav';
import { AddHabitModal } from './AddHabitModal';
import { HomeScreen, InsightsScreen, TasksScreen, FocusTrackerScreen } from '../screens';
import { ProfileScreen } from '../screens/ProfileScreen';
import { Habit } from '../types';

import { useHabits } from '../context/HabitContext';

export function MobileDashboard() {
    const { setCurrentMonth } = useHabits();
    const [activeTab, setActiveTab] = useState<TabType>('home');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

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

    const handleTabChange = (tab: TabType) => {
        if ((tab === 'home' && activeTab === 'home') || tab !== activeTab) {
            setIsEditMode(false);
        }
        setActiveTab(tab);
    };

    return (
        <div className="min-h-screen" style={{ background: '#FFF8E7' }}>
            {/* Main Content - Constrained for iPad */}
            <div className="max-w-lg mx-auto pb-safe">
                {activeTab === 'home' && (
                    <HomeScreen
                        selectedDate={selectedDate}
                        onDateChange={handleDateChange}
                        onEditHabit={handleEditHabit}
                        onAddHabit={handleAddHabit}
                        isEditMode={isEditMode}
                        onToggleEditMode={setIsEditMode}
                    />
                )}
                {activeTab === 'stats' && (
                    <InsightsScreen />
                )}
                {activeTab === 'focus' && (
                    <FocusTrackerScreen />
                )}
                {activeTab === 'tasks' && (
                    <TasksScreen />
                )}
                {activeTab === 'profile' && (
                    <ProfileScreen />
                )}
            </div>

            {/* Bottom Navigation */}
            <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

            {/* Add/Edit Habit Modal */}
            <AddHabitModal
                isOpen={isAddHabitModalOpen}
                onClose={handleCloseModal}
                initialHabit={editingHabit}
            />
        </div>
    );
}
