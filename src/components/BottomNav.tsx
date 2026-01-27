import React from 'react';
import { Home, BarChart3, User } from 'lucide-react';

export type TabType = 'track' | 'stats' | 'profile';

interface BottomNavProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
    const tabs: { id: TabType; icon: React.ReactNode; label: string }[] = [
        { id: 'track', icon: <Home className="w-6 h-6" />, label: 'Track' },
        { id: 'stats', icon: <BarChart3 className="w-6 h-6" />, label: 'Stats' },
        { id: 'profile', icon: <User className="w-6 h-6" />, label: 'Profile' },
    ];

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50"
            style={{
                background: '#2D2D2D',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)',
                paddingBottom: 'env(safe-area-inset-bottom)',
            }}
        >
            <div className="flex items-center justify-around px-4 py-4">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className="flex flex-col items-center gap-1 transition-all duration-200"
                        style={{
                            color: activeTab === tab.id ? '#FFFFFF' : '#9E9E9E',
                        }}
                    >
                        <div
                            className="flex items-center justify-center transition-all duration-200"
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: activeTab === tab.id ? '#FF7A6B' : 'transparent',
                            }}
                        >
                            {tab.icon}
                        </div>
                        <span className="text-xs font-medium">{tab.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};
