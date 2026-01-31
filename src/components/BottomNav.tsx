import React from 'react';
import { Home, BarChart3, User, CheckSquare, Clock } from 'lucide-react';

export type TabType = 'home' | 'stats' | 'tasks' | 'profile' | 'focus';

interface BottomNavProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
    const tabs: { id: TabType; icon: React.ReactNode; label: string }[] = [
        { id: 'home', icon: <Home className="w-6 h-6" />, label: 'Home' },
        { id: 'stats', icon: <BarChart3 className="w-6 h-6" />, label: 'Stats' },
        { id: 'focus', icon: <Clock className="w-6 h-6" />, label: 'Focus' },
        { id: 'tasks', icon: <CheckSquare className="w-6 h-6" />, label: 'Tasks' },
        { id: 'profile', icon: <User className="w-6 h-6" />, label: 'Profile' },
    ];

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50"
            style={{
                background: '#2D2D2D',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
                paddingBottom: 'env(safe-area-inset-bottom)',
            }}
        >
            <div className="flex items-center justify-around px-2 py-3 max-w-lg mx-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className="flex flex-col items-center gap-1.5 transition-all duration-300 px-2 py-2 rounded-xl"
                        style={{
                            color: activeTab === tab.id ? '#FFFFFF' : '#9E9E9E',
                            background: activeTab === tab.id ? 'rgba(255, 122, 107, 0.2)' : 'transparent',
                            transform: activeTab === tab.id ? 'scale(1.05)' : 'scale(1)',
                        }}
                    >
                        <div
                            className="flex items-center justify-center transition-all duration-300"
                            style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '50%',
                                background: activeTab === tab.id ? '#FF7A6B' : 'transparent',
                                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(255, 122, 107, 0.3)' : 'none',
                            }}
                        >
                            {tab.icon}
                        </div>
                        <span className="text-xs font-semibold">{tab.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};
