import React from 'react';
import { Home, BarChart3, User, CheckSquare } from 'lucide-react';

export type TabType = 'track' | 'stats' | 'tasks' | 'profile';

interface SidebarProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    onAddHabit: () => void;
    user?: any;
}

export const Sidebar: React.FC<SidebarProps> = ({
    activeTab,
    onTabChange,
    onAddHabit,
    user
}) => {
    const tabs: { id: TabType; icon: React.ReactNode; label: string }[] = [
        { id: 'track', icon: <Home className="w-5 h-5" />, label: 'Track' },
        { id: 'stats', icon: <BarChart3 className="w-5 h-5" />, label: 'Stats' },
        { id: 'tasks', icon: <CheckSquare className="w-5 h-5" />, label: 'Tasks' },
        { id: 'profile', icon: <User className="w-5 h-5" />, label: 'Profile' },
    ];

    return (
        <aside
            className="w-64 flex-shrink-0 border-r"
            style={{
                background: '#FFFFFF',
                borderColor: '#F0F0F0',
            }}
        >
            <div className="flex flex-col h-full p-6">
                {/* Logo/Brand */}
                <div className="mb-8">
                    <h1 className="text-xl font-bold" style={{ color: '#1F1F1F' }}>
                        Habit Tracker
                    </h1>
                    <p className="text-sm mt-1" style={{ color: '#6B6B6B' }}>
                        {user?.email || 'User'}
                    </p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                            style={{
                                background: activeTab === tab.id ? '#FF7A6B' : 'transparent',
                                color: activeTab === tab.id ? '#FFFFFF' : '#6B6B6B',
                            }}
                        >
                            {tab.icon}
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Add Habit Button */}
                <button
                    onClick={onAddHabit}
                    className="w-full py-3 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
                    style={{
                        background: 'linear-gradient(135deg, #FF7A6B 0%, #FFA094 100%)',
                        color: '#FFFFFF',
                        boxShadow: '0 4px 12px rgba(255, 122, 107, 0.3)',
                    }}
                >
                    <span className="text-lg mr-2">+</span>
                    New Habit
                </button>
            </div>
        </aside>
    );
};
