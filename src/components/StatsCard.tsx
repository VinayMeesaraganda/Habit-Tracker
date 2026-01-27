import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    iconColor: string;
    bgColor: string;
    trend?: string;
    trendUp?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    icon: Icon,
    iconColor,
    bgColor,
    trend,
    trendUp
}) => {
    return (
        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col justify-between h-full min-h-[120px]">
            <div className="flex justify-between items-start mb-2">
                <div
                    className="p-2 rounded-xl"
                    style={{ background: bgColor }}
                >
                    <Icon className="w-5 h-5" style={{ color: iconColor }} />
                </div>
                {trend && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {trend}
                    </span>
                )}
            </div>

            <div>
                <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
            </div>
        </div>
    );
};
