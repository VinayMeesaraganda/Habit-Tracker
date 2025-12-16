import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import { CATEGORY_COLORS } from '../utils/colors';

// Custom Minimal Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900/90 text-white text-xs py-1 px-2 rounded-lg shadow-xl backdrop-blur-sm border border-gray-700">
                <p className="font-bold mb-0.5">{label}</p>
                <p className="text-emerald-400">Completed: {payload[0].value}</p>
            </div>
        );
    }
    return null;
};

export const DailyCompletionChart = ({ data }: { data: any[] }) => {
    return (
        <div className="h-64 w-full">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Daily Consistency</h3>
                <span className="text-xs text-gray-400 font-medium">Last 30 Days</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#F3F4F6" strokeDasharray="3 3" />
                    <XAxis
                        dataKey="day"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 10, fill: '#9CA3AF' }}
                        tickFormatter={(str) => {
                            const date = new Date(str);
                            return date.getDate() % 5 === 0 ? date.getDate().toString() : '';
                        }}
                        interval={0}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 10, fill: '#9CA3AF' }}
                        allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="completed"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCompleted)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export const CategoryBreakdownChart = ({ data }: { data: any[] }) => {
    return (
        <div className="h-64 w-full">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Habits by Category</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: -20, bottom: 0 }} barSize={12}>
                    <CartesianGrid horizontal={true} vertical={false} stroke="#F3F4F6" />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        tickLine={false}
                        axisLine={false}
                        width={80}
                        tick={{ fontSize: 11, fill: '#4B5563', fontWeight: 500 }}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-gray-900/90 text-white text-xs py-1 px-2 rounded-lg shadow-xl backdrop-blur-sm border border-gray-700">
                                        <span className="font-bold">{payload[0].payload.name}:</span> <span className="text-emerald-400">{payload[0].value}</span>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {data.map((entry, index) => {
                            const colors = ['#F472B6', '#34D399', '#60A5FA', '#FBBF24', '#A78BFA'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
