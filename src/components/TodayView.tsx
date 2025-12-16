/**
 * TodayView - Main Container
 * Handles Responsive Switching between Mobile (Card View) and Desktop (Matrix View).
 */

import { MobileDashboard } from './MobileDashboard';
import { DesktopDashboard } from './DesktopDashboard';

export function TodayView() {
    return (
        <>
            {/* Mobile View (< 768px) */}
            <div className="md:hidden">
                <MobileDashboard />
            </div>

            {/* Desktop View (>= 768px) */}
            <div className="hidden md:block">
                <DesktopDashboard />
            </div>
        </>
    );
}
