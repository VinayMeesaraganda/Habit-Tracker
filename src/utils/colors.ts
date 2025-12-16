

interface ColorScheme {
    bg: string;
    text: string;
    border: string;
    icon: string;
}

export const CATEGORY_COLORS: Record<string, ColorScheme & { hex: string }> = {
    'Health ❤️‍🩹': {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: 'text-emerald-500',
        hex: '#10B981' // Emerald-500
    },
    'Fitness 💪': {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: 'text-blue-500',
        hex: '#3B82F6' // Blue-500
    },
    'Mindfulness 🧘': {
        bg: 'bg-violet-50',
        text: 'text-violet-700',
        border: 'border-violet-200',
        icon: 'text-violet-500',
        hex: '#8B5CF6' // Violet-500
    },
    'Learning 📚': {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: 'text-amber-500',
        hex: '#F59E0B' // Amber-500
    },
    'Productivity 🎯': {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        icon: 'text-orange-500',
        hex: '#F97316' // Orange-500
    },
    'Social 👥': {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        icon: 'text-rose-500',
        hex: '#F43F5E' // Rose-500
    },
    'Finance 💰': {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
        icon: 'text-slate-500',
        hex: '#64748B' // Slate-500
    },
    'Creativity 🎨': {
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        icon: 'text-indigo-500',
        hex: '#6366F1' // Indigo-500
    },
    'Other 📌': {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: 'text-gray-500',
        hex: '#6B7280' // Gray-500
    }
};

export const getCategoryColor = (category: string): ColorScheme => {
    return CATEGORY_COLORS[category] || {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: 'text-gray-500'
    };
};
