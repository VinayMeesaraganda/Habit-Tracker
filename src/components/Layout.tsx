/**
 * Layout component - Premium dark responsive container
 */

import { ReactNode } from 'react';
import { Home, LogOut, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
    children: ReactNode;
    currentView: 'today' | 'calendar' | 'analytics' | 'settings';
    onViewChange: (view: 'today' | 'calendar' | 'analytics' | 'settings') => void;
}

export function Layout({ children, currentView, onViewChange }: LayoutProps) {
    const { user, signOut } = useAuth();

    const navItems = [
        { id: 'today' as const, label: 'Dashboard', icon: Home },
    ];

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white pb-20 md:pb-0 relative overflow-hidden">
            {/* Background gradient orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px]" />
            </div>

            {/* Desktop Header */}
            <header className="hidden md:block bg-[#0A0A0B]/80 backdrop-blur-lg border-b border-white/5 sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                                <Target className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight">
                                Habit Tracker
                            </h1>
                        </div>

                        {/* Navigation */}
                        <nav className="flex gap-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => onViewChange(item.id)}
                                        className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </nav>

                        {/* User section */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400">{user?.email}</span>
                            <button
                                onClick={signOut}
                                className="btn-secondary px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 container mx-auto px-4 py-6 md:px-6 md:py-8">
                {children}
            </main>
        </div>
    );
}
