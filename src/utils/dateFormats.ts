/**
 * Date Format Constants
 * Centralized date formatting strings
 */

export const DATE_FORMATS = {
    // Display formats
    FULL_DATE: 'EEEE, MMMM d, yyyy',
    SHORT_DATE: 'EEE, MMM d',
    MONTH_DAY: 'EEEE, MMM d',
    MONTH_YEAR: 'MMMM yyyy',

    // Storage format
    ISO_DATE: 'yyyy-MM-dd',
} as const;
