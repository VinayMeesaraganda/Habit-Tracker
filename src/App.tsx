import { useState, Suspense, lazy } from 'react';
import { HabitProvider, useHabits } from './context/HabitContext';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { Loader2 } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load the heavy chart/dashboard components
const TodayView = lazy(() => import('./components/TodayView').then(module => ({ default: module.TodayView })));

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
                <Suspense fallback={
                    <div className="flex h-[50vh] items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                }>
                    {currentView === 'today' && <TodayView />}
                    {/* Placeholder views removed for production release. 
                        Features are integrated into the main Dashboard. 
                    */}
                </Suspense>
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
