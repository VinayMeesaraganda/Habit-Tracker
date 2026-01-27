import { useState, Suspense, lazy, useEffect } from 'react';
import { HabitProvider, useHabits } from './context/HabitContext';
import { TaskProvider } from './context/TaskContext';
import { Auth } from './components/Auth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FullPageLoader } from './components/ui/LoadingSpinner';

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

function AppContent() {
    const { user, loading } = useHabits();
    const isMobile = useIsMobile();

    if (loading) {
        return <FullPageLoader text="Loading your habits..." />;
    }

    if (!user) {
        return <Auth />;
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
                <AppContent />
            </TaskProvider>
        </HabitProvider>
    );
}
