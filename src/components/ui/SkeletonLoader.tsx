/**
 * SkeletonLoader - Premium dark skeleton components for loading states
 */

interface SkeletonProps {
    className?: string;
}

export function SkeletonPulse({ className = '' }: SkeletonProps) {
    return (
        <div className={`animate-pulse bg-white/5 rounded ${className}`} />
    );
}

export function SkeletonText({ className = '', lines = 1 }: SkeletonProps & { lines?: number }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="h-4 bg-white/5 rounded animate-pulse"
                    style={{ width: i === lines - 1 && lines > 1 ? '70%' : '100%' }}
                />
            ))}
        </div>
    );
}

export function SkeletonCircle({ size = 48, className = '' }: SkeletonProps & { size?: number }) {
    return (
        <div
            className={`rounded-full bg-white/5 animate-pulse ${className}`}
            style={{ width: size, height: size }}
        />
    );
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
    return (
        <div className={`rounded-2xl bg-white/[0.03] border border-white/5 p-4 animate-pulse ${className}`}>
            <div className="flex items-center gap-3 mb-4">
                <SkeletonCircle size={40} />
                <div className="flex-1">
                    <SkeletonText className="w-2/3 mb-2" />
                    <SkeletonText className="w-1/2" />
                </div>
            </div>
            <SkeletonText lines={2} />
        </div>
    );
}

export function SkeletonRing({ size = 100 }: { size?: number }) {
    return (
        <div className="flex flex-col items-center gap-2">
            <div
                className="rounded-full border-4 border-white/5 animate-pulse"
                style={{ width: size, height: size }}
            />
            <SkeletonPulse className="h-3 w-16" />
        </div>
    );
}
