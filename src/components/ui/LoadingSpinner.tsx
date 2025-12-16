/**
 * LoadingSpinner - Centralized loading spinner component
 */
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    text?: string;
}

export function LoadingSpinner({ size = 'md', className = '', text }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-500`} />
            {text && <p className="text-sm text-gray-400">{text}</p>}
        </div>
    );
}

export function FullPageLoader({ text = 'Loading...' }: { text?: string }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
            <LoadingSpinner size="lg" text={text} />
        </div>
    );
}
