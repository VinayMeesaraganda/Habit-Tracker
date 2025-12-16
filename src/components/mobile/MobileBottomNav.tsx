/**
 * MobileBottomNav - Premium dark bottom navigation bar
 */
import { memo } from 'react';
import { List, CheckSquare, BarChart2, Plus } from 'lucide-react';

type TabType = 'today' | 'habits' | 'analytics';

interface MobileBottomNavProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    onAddClick: () => void;
    onTodayReset: () => void;
}

export const MobileBottomNav = memo(function MobileBottomNav({
    activeTab,
    onTabChange,
    onAddClick,
    onTodayReset
}: MobileBottomNavProps) {
    return (
        <>
            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0B]/90 backdrop-blur-lg border-t border-white/10 px-6 py-2 flex justify-around items-center z-30 pb-safe">
                <button
                    onClick={() => {
                        onTabChange('today');
                        onTodayReset();
                    }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'today' ? 'text-primary-400 bg-primary-500/20' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
                >
                    <List className="w-6 h-6" strokeWidth={activeTab === 'today' ? 2.5 : 2} />
                    <span className="text-[10px] font-bold">Today</span>
                </button>

                <button
                    onClick={() => onTabChange('habits')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'habits' ? 'text-primary-400 bg-primary-500/20' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
                >
                    <CheckSquare className="w-6 h-6" strokeWidth={activeTab === 'habits' ? 2.5 : 2} />
                    <span className="text-[10px] font-bold">Habits</span>
                </button>

                <button
                    onClick={() => onTabChange('analytics')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'analytics' ? 'text-purple-400 bg-purple-500/20' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
                >
                    <BarChart2 className="w-6 h-6" strokeWidth={activeTab === 'analytics' ? 2.5 : 2} />
                    <span className="text-[10px] font-bold">Stats</span>
                </button>
            </div>

            {/* FAB - Today & Habits View Only */}
            {(activeTab === 'today' || activeTab === 'habits') && (
                <button
                    onClick={onAddClick}
                    className="fixed bottom-24 right-5 w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 text-white rounded-xl shadow-xl shadow-primary-500/30 flex items-center justify-center hover:scale-105 transition-transform active:scale-95 z-40"
                >
                    <Plus className="w-6 h-6" />
                </button>
            )}
        </>
    );
});
