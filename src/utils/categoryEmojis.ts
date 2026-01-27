/**
 * Category Emoji Mapping
 * Centralized category to emoji mapping used across the app
 */

export const CATEGORY_EMOJI_MAP: Record<string, string> = {
    'Health': '🏥',
    'Fitness': '💪',
    'Learning': '📚',
    'Productivity': '⚡',
    'Mindfulness': '🧘',
    'Social': '👥',
    'Finance': '💰',
    'Creativity': '🎨',
};

export const getCategoryEmoji = (category: string): string => {
    return CATEGORY_EMOJI_MAP[category] || '⚪';
};
