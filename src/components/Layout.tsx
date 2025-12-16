/**
 * Layout component - Responsive container with mobile navigation
 */

import { ReactNode } from 'react';
import { Home, LogOut } from 'lucide-react';
import { useHabits } from '../context/HabitContext';

interface LayoutProps {
    children: ReactNode;
    currentView: 'today' | 'calendar' | 'analytics' | 'settings';
    onViewChange: (view: 'today' | 'calendar' | 'analytics' | 'settings') => void;
}

export function Layout({ children, currentView, onViewChange }: LayoutProps) {
    const { user, signOut } = useHabits();

    const navItems = [
        { id: 'today' as const, label: 'Dashboard', icon: Home },
        // Future tabs can be added here
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            {/* Desktop Header */}
            <header className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold gradient-text">
                            Habit Tracker
                        </h1>

                        <nav className="flex gap-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => onViewChange(item.id)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${currentView === item.id
                                            ? 'bg-primary-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">{user?.email}</span>
                            <button
                                onClick={signOut}
                                className="btn btn-secondary flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6 md:py-8">
                {children}
            </main>

            {/* Mobile Bottom Navigation - REMOVED (Handled by MobileDashboard) */}
            {/* <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
                <div className="flex justify-around items-center py-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onViewChange(item.id)}
                                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${currentView === item.id
                                    ? 'text-primary-600'
                                    : 'text-gray-400'
                                    }`}
                            >
                                <Icon className="w-6 h-6" />
                                <span className="text-xs font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav> */}
        </div>
    );
}
