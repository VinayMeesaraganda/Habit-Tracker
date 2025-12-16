/**
 * Main App component
 */

import { useState } from 'react';
import { HabitProvider, useHabits } from './context/HabitContext';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { TodayView } from './components/TodayView';
import { Loader2 } from 'lucide-react';

import { ErrorBoundary } from './components/ErrorBoundary';

function AppContent() {
    const { user, loading } = useHabits();
    const [currentView, setCurrentView] = useState<'today' | 'calendar' | 'analytics' | 'settings'>('today');

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
                    <p className="text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Auth />;
    }

    return (
        <ErrorBoundary>
            <Layout currentView={currentView} onViewChange={setCurrentView}>
                {currentView === 'today' && <TodayView />}
                {currentView === 'calendar' && (
                    <div className="card text-center py-12">
                        <h2 className="text-2xl font-bold text-slate-300 mb-2">Calendar View</h2>
                        <p className="text-slate-400">Coming soon...</p>
                    </div>
                )}
                {/* ... other views ... */}
                {currentView === 'analytics' && (
                    <div className="card text-center py-12">
                        <h2 className="text-2xl font-bold text-slate-300 mb-2">Analytics</h2>
                        <p className="text-slate-400">Coming soon...</p>
                    </div>
                )}
                {currentView === 'settings' && (
                    <div className="card text-center py-12">
                        <h2 className="text-2xl font-bold text-slate-300 mb-2">Settings</h2>
                        <p className="text-slate-400">Coming soon...</p>
                    </div>
                )}
            </Layout>
        </ErrorBoundary>
    );
}

export default function App() {
    return (
        <HabitProvider>
            <AppContent />
        </HabitProvider>
    );
}
