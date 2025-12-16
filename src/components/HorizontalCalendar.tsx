
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { useRef, useEffect } from 'react';

interface HorizontalCalendarProps {
    currentMonth: Date;
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
}

export function HorizontalCalendar({ currentMonth, selectedDate, onSelectDate }: HorizontalCalendarProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const monthDays = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    });

    // Auto-scroll to selected date on mount or change
    useEffect(() => {
        if (scrollRef.current) {
            const selectedEl = scrollRef.current.querySelector('[data-selected="true"]');
            if (selectedEl) {
                selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [selectedDate, currentMonth]);

    return (
        <div className="w-full bg-[#0A0A0B] border-b border-white/5 sticky top-0 z-30">
            <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-3 p-4 no-scrollbar items-center px-4 md:px-6 snap-x scrollbar-dark"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {monthDays.map(day => {
                    const isSelected = isSameDay(day, selectedDate);
                    const isCurrentDay = isToday(day);

                    return (
                        <button
                            key={day.toISOString()}
                            data-selected={isSelected}
                            onClick={() => onSelectDate(day)}
                            className={`
                                flex flex-col items-center justify-center min-w-[56px] h-[72px] rounded-2xl transition-all duration-300 snap-center
                                ${isSelected
                                    ? 'bg-gradient-to-br from-primary-500 to-purple-600 text-white shadow-lg shadow-primary-500/30 scale-105 transform'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent'
                                }
                                ${isCurrentDay && !isSelected ? 'border-primary-500/30 bg-primary-500/10 text-primary-400' : ''}
                            `}
                        >
                            <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                                {format(day, 'EEE')}
                            </span>
                            <span className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                {format(day, 'd')}
                            </span>

                            {/* Dot indicator for Today if not selected */}
                            {isCurrentDay && !isSelected && (
                                <div className="mt-1 w-1 h-1 rounded-full bg-primary-500" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
