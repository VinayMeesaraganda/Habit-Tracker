/**
 * TodayView - Main Container
 * Handles Responsive Switching between Mobile (Card View) and Desktop (Matrix View).
 * Uses Lazy Loading to split bundles.
 */

import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const MobileDashboard = lazy(() => import('./MobileDashboard').then(m => ({ default: m.MobileDashboard })));
const DesktopDashboard = lazy(() => import('./DesktopDashboard').then(m => ({ default: m.DesktopDashboard })));

export function TodayView() {
    return (
        <Suspense fallback={
            <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
            </div>
        }>
            {/* Mobile View (< 768px) */}
            <div className="md:hidden">
                <MobileDashboard />
            </div>

            {/* Desktop View (>= 768px) */}
            <div className="hidden md:block">
                <DesktopDashboard />
            </div>
        </Suspense>
    );
}
