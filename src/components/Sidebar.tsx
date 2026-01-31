import React from 'react';
import { Home, BarChart3, User, CheckSquare, Clock } from 'lucide-react';

export type TabType = 'home' | 'stats' | 'tasks' | 'profile' | 'focus';

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
        { id: 'home', icon: <Home className="w-5 h-5" />, label: 'Home' },
        { id: 'stats', icon: <BarChart3 className="w-5 h-5" />, label: 'Stats' },
        { id: 'focus', icon: <Clock className="w-5 h-5" />, label: 'Focus' },
        { id: 'tasks', icon: <CheckSquare className="w-5 h-5" />, label: 'Tasks' },
        { id: 'profile', icon: <User className="w-5 h-5" />, label: 'Profile' },
    ];

    return (
        <aside
            className="w-72 flex-shrink-0 bg-white border-r border-[#F0F0F0] flex flex-col transition-all duration-300"
            style={{ height: '100vh', position: 'sticky', top: 0 }}
        >
            <div className="p-8 pb-4">
                {/* Logo/Brand */}
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                        <CheckSquare className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none">
                            Habit
                        </h1>
                        <h1 className="text-xl font-black text-orange-500 tracking-tight leading-none">
                            Tracker
                        </h1>
                    </div>
                </div>

                {/* Add Habit Button */}
                <button
                    onClick={onAddHabit}
                    className="w-full py-3.5 px-4 rounded-2xl font-bold text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-8 group"
                    style={{
                        background: 'linear-gradient(135deg, #FF7A6B 0%, #FFA094 100%)',
                    }}
                >
                    <div className="bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition-colors">
                        <span className="text-lg leading-none">+</span>
                    </div>
                    New Habit
                </button>

                {/* Navigation */}
                <nav className="space-y-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all font-semibold ${activeTab === tab.id
                                ? 'bg-orange-50 text-orange-600 shadow-sm ring-1 ring-orange-100'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            {React.cloneElement(tab.icon as React.ReactElement, {
                                className: `w-5 h-5 ${activeTab === tab.id ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-600'} transition-colors`,
                                strokeWidth: activeTab === tab.id ? 2.5 : 2
                            })}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Bottom Section */}
            <div className="mt-auto p-6 border-t border-gray-50">
                <button
                    onClick={() => onTabChange('profile')} // Navigate to profile on click
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors text-left group"
                >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold group-hover:bg-orange-100 group-hover:text-orange-500 transition-colors">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                            {user?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                            {user?.email}
                        </p>
                    </div>
                </button>
            </div>
        </aside>
    );
};
