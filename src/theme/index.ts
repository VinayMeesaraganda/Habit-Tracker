/**
 * Theme System - Central Export
 */

export * from './colors';
export * from './spacing';
export * from './radius';
export * from './shadows';

import { colors } from './colors';
import { spacing } from './spacing';
import { radius } from './radius';
import { shadows } from './shadows';

export const theme = {
    colors,
    spacing,
    radius,
    shadows,
} as const;

export default theme;
