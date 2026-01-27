import { useState, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';
import { AddHabitModal } from './AddHabitModal';
import { Sidebar, TabType } from './Sidebar';
import { TrackScreen, InsightsScreen, TasksScreen } from '../screens';
import { ProfileScreen } from '../screens/ProfileScreen';
import { Habit } from '../types';

export function DesktopDashboard() {
    const { currentMonth, user } = useHabits();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState<TabType>('track');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

    // Update document title based on active tab
    useEffect(() => {
        const titles: Record<TabType, string> = {
            track: 'Track',
            stats: 'Stats',
            tasks: 'Tasks',
            profile: 'Profile',
        };
        document.title = `${titles[activeTab]} | Habit Tracker`;
    }, [activeTab]);

    // Handle add habit button click
    const handleAddHabit = () => {
        setEditingHabit(null);
        setIsAddModalOpen(true);
    };

    // Handle edit habit
    const handleEditHabit = (habit: Habit) => {
        setEditingHabit(habit);
        setIsAddModalOpen(true);
    };

    // Handle modal close
    const handleModalClose = () => {
        setIsAddModalOpen(false);
        setEditingHabit(null);
    };

    // Handle date change
    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
    };

    return (
        <div className="flex min-h-screen" style={{ background: '#FFF8E7' }}>
            {/* Sidebar */}
            <Sidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onAddHabit={handleAddHabit}
                user={user}
            />

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
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
                {activeTab === 'tasks' && (
                    <TasksScreen />
                )}
                {activeTab === 'profile' && (
                    <ProfileScreen />
                )}
            </div>

            {/* Modals */}
            {isAddModalOpen && (
                <AddHabitModal
                    isOpen={isAddModalOpen}
                    onClose={handleModalClose}
                    initialHabit={editingHabit}
                />
            )}
        </div>
    );
}
