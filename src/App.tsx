import { useState, Suspense, lazy, useEffect } from 'react';
import { HabitProvider, useHabits } from './context/HabitContext';
import { TaskProvider } from './context/TaskContext';
import { Auth } from './components/Auth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FullPageLoader } from './components/ui/LoadingSpinner';
import { OnboardingScreen } from './screens/OnboardingScreen';

// Lazy load the heavy dashboard components for code splitting
const MobileDashboard = lazy(() => import('./components/MobileDashboard').then(module => ({ default: module.MobileDashboard })));
const DesktopDashboard = lazy(() => import('./components/DesktopDashboard').then(module => ({ default: module.DesktopDashboard })));

// Hook to detect mobile viewport
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isMobile;
}

import { useNotificationScheduler } from './hooks/useNotificationScheduler';

// ...

function AppContent() {
    const { user, loading, habits } = useHabits();
    const isMobile = useIsMobile();
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Activate Notification Scheduler
    useNotificationScheduler();

    useEffect(() => {
        if (!loading && user) {
            const hasOnboarded = localStorage.getItem('has_onboarded');

            // If user already has habits, mark as onboarded automatically (legacy users)
            if (habits.length > 0) {
                if (!hasOnboarded) {
                    localStorage.setItem('has_onboarded', 'true');
                }
                setShowOnboarding(false);
            } else if (!hasOnboarded) {
                // Only show if no habits AND no flag
                setShowOnboarding(true);
            }
        }
    }, [user, loading, habits.length]);

    if (loading) {
        return <FullPageLoader text="Loading your habits..." />;
    }

    if (!user) {
        return <Auth />;
    }

    if (showOnboarding) {
        return <OnboardingScreen onComplete={() => setShowOnboarding(false)} />;
    }

    return (
        <ErrorBoundary>
            <Suspense fallback={<FullPageLoader text="Loading dashboard..." />}>
                {isMobile ? <MobileDashboard /> : <DesktopDashboard />}
            </Suspense>
        </ErrorBoundary>
    );
}

export default function App() {
    return (
        <HabitProvider>
            <TaskProvider>
                <ErrorBoundary>
                    <AppContent />
                </ErrorBoundary>
            </TaskProvider>
        </HabitProvider>
    );
}
