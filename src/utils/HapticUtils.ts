/**
 * HapticUtils - Wrapper for Navigator.vibrate API
 * Provides tactile feedback for user interactions.
 */

export const Haptics = {
    // Light impact (e.g., toggle switch, tab change)
    light: () => {
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    },

    // Medium impact (e.g., button press)
    medium: () => {
        if (navigator.vibrate) {
            navigator.vibrate(20);
        }
    },

    // Heavy impact (e.g., task completion, success)
    success: () => {
        if (navigator.vibrate) {
            navigator.vibrate([10, 30, 10]); // Three quick pulses
        }
    },

    // Error impact (e.g., validation failure)
    error: () => {
        if (navigator.vibrate) {
            navigator.vibrate([50, 30, 50, 30, 50]); // Three longer pulses
        }
    }
};

/**
 * Hook to use haptics easily
 */
export const useHaptic = () => {
    return {
        triggerLight: Haptics.light,
        triggerMedium: Haptics.medium,
        triggerSuccess: Haptics.success,
        triggerError: Haptics.error,
    };
};
