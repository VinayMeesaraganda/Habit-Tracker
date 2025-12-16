/**
 * DashboardSkeleton - Full dashboard loading skeleton
 * Matches the premium dark theme layout
 */
import { SkeletonPulse, SkeletonCard, SkeletonRing, SkeletonCircle } from '../ui/SkeletonLoader';

export function MobileDashboardSkeleton() {
    return (
        <div className="min-h-screen bg-[#0A0A0B] pb-24">
            {/* Header Skeleton */}
            <div className="px-4 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <SkeletonPulse className="h-3 w-20 mb-2" />
                        <SkeletonPulse className="h-8 w-32" />
                    </div>
                    <SkeletonCircle size={40} />
                </div>

                {/* Progress Card Skeleton */}
                <div className="card-glass p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <SkeletonPulse className="h-3 w-24 mb-2" />
                            <SkeletonPulse className="h-6 w-16" />
                        </div>
                        <SkeletonRing size={80} />
                    </div>
                </div>
            </div>

            {/* Calendar Strip Skeleton */}
            <div className="px-4 mb-4">
                <div className="flex gap-3 overflow-hidden">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <SkeletonPulse className="h-3 w-8" />
                            <SkeletonPulse className="h-14 w-14 rounded-2xl" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Habit Cards Skeleton */}
            <div className="px-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>

            {/* Bottom Nav Skeleton */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0B]/90 border-t border-white/10 px-6 py-4">
                <div className="flex justify-around">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <SkeletonPulse className="h-6 w-6 rounded" />
                            <SkeletonPulse className="h-2 w-10" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function DesktopDashboardSkeleton() {
    return (
        <div className="min-h-screen bg-[#0A0A0B] p-6">
            <div className="max-w-[1400px] mx-auto space-y-6">
                {/* Header Skeleton */}
                <div className="card-glass p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <SkeletonPulse className="h-4 w-24 mb-2" />
                            <SkeletonPulse className="h-10 w-48" />
                        </div>
                        <div className="flex items-center gap-6">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <SkeletonRing key={i} size={80} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Matrix Skeleton */}
                <div className="card-glass p-4">
                    {/* Header Row */}
                    <div className="flex gap-2 mb-4 pb-4 border-b border-white/10">
                        <SkeletonPulse className="h-8 w-60" />
                        <SkeletonPulse className="h-8 w-32" />
                        <SkeletonPulse className="h-8 w-20" />
                        <div className="flex-1 flex gap-1">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <SkeletonPulse key={i} className="h-8 w-8" />
                            ))}
                        </div>
                    </div>

                    {/* Habit Rows */}
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex gap-2 py-3 border-b border-white/5">
                            <SkeletonPulse className="h-6 w-60" />
                            <SkeletonPulse className="h-6 w-32" />
                            <SkeletonPulse className="h-6 w-20" />
                            <div className="flex-1 flex gap-1">
                                {Array.from({ length: 20 }).map((_, j) => (
                                    <SkeletonPulse key={j} className="h-6 w-6 rounded" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Analytics Skeleton */}
                <div className="card-glass p-6">
                    <SkeletonPulse className="h-6 w-48 mb-6" />
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/5 rounded-xl p-4 h-64">
                            <SkeletonPulse className="h-4 w-32 mb-4" />
                            <SkeletonPulse className="h-48 w-full rounded-lg" />
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 h-64">
                            <SkeletonPulse className="h-4 w-32 mb-4" />
                            <SkeletonPulse className="h-48 w-full rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
