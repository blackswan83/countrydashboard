/**
 * Centralized theme color utility for dark mode support
 * All components should use these functions for consistent theming
 */

export const getThemeColors = (darkMode: boolean) => ({
  // Backgrounds
  bgPrimary: darkMode ? '#0D1117' : '#E8E4DC',
  bgSecondary: darkMode ? '#161B22' : '#D4CFC4',
  bgTertiary: darkMode ? '#21262D' : '#F5F0EB',
  bgCard: darkMode ? '#1C2128' : '#FFFFFF',
  bgElevated: darkMode ? '#2D333B' : '#FFFFFF',

  // Text
  textPrimary: darkMode ? '#F0F6FC' : '#3D3D3D',
  textSecondary: darkMode ? '#8B949E' : '#6B6B6B',
  textMuted: darkMode ? '#6E7681' : '#8B8B8B',

  // Brand
  primary: darkMode ? '#D4B896' : '#8B7355',
  gold: darkMode ? '#E8CCA8' : '#C4A77D',

  // Semantic colors
  success: darkMode ? '#3FB950' : '#4A7C59',
  danger: darkMode ? '#F85149' : '#C75B5B',
  warning: darkMode ? '#D29922' : '#D4A574',
  info: darkMode ? '#58A6FF' : '#00A0B0',
  secondary: darkMode ? '#39D0D6' : '#00A0B0',

  // Lighter semantic variants
  successLight: darkMode ? '#56D364' : '#10B981',
  dangerLight: darkMode ? '#FF7B72' : '#EF4444',
  warningLight: darkMode ? '#E3B341' : '#F59E0B',

  // Dim backgrounds for badges/tags
  successDim: darkMode ? 'rgba(63, 185, 80, 0.15)' : 'rgba(74, 124, 89, 0.15)',
  dangerDim: darkMode ? 'rgba(248, 81, 73, 0.15)' : 'rgba(199, 91, 91, 0.15)',
  warningDim: darkMode ? 'rgba(210, 153, 34, 0.15)' : 'rgba(212, 165, 116, 0.15)',
  infoDim: darkMode ? 'rgba(88, 166, 255, 0.15)' : 'rgba(0, 160, 176, 0.15)',

  // Charts
  chartGrid: darkMode ? 'rgba(240, 246, 252, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  chartText: darkMode ? '#8B949E' : '#8B8B8B',
  chartLine1: darkMode ? '#58A6FF' : '#00A0B0',
  chartLine2: darkMode ? '#3FB950' : '#4A7C59',
  chartLine3: darkMode ? '#F85149' : '#C75B5B',
  chartLine4: darkMode ? '#D29922' : '#D4A574',
  chartLine5: darkMode ? '#A371F7' : '#8B5CF6',

  // Borders
  border: darkMode ? 'rgba(240, 246, 252, 0.1)' : 'rgba(139, 115, 85, 0.2)',
  borderLight: darkMode ? 'rgba(240, 246, 252, 0.05)' : 'rgba(139, 115, 85, 0.1)',
  borderAccent: darkMode ? 'rgba(212, 184, 150, 0.3)' : 'rgba(139, 115, 85, 0.3)',
});

/**
 * Get color for health/milestone status
 */
export const getStatusColor = (status: string, darkMode: boolean): string => {
  const colors: Record<string, string> = {
    healthy: darkMode ? '#3FB950' : '#4A7C59',
    improved: darkMode ? '#56D364' : '#10B981',
    managed: darkMode ? '#39D0D6' : '#00A0B0',
    'at-risk': darkMode ? '#D29922' : '#F59E0B',
    diagnosed: darkMode ? '#F85149' : '#EF4444',
    critical: darkMode ? '#FF7B72' : '#991B1B',
  };
  return colors[status] || (darkMode ? '#6E7681' : '#8B8B8B');
};

/**
 * Get color for score/grade display
 */
export const getGradeColor = (score: number, darkMode: boolean): string => {
  if (score >= 80) return darkMode ? '#3FB950' : '#4A7C59';
  if (score >= 70) return darkMode ? '#56D364' : '#4A7C59';
  if (score >= 60) return darkMode ? '#39D0D6' : '#10B981';
  if (score >= 50) return darkMode ? '#D29922' : '#F59E0B';
  if (score >= 40) return darkMode ? '#F85149' : '#EF4444';
  return darkMode ? '#FF7B72' : '#991B1B';
};

/**
 * Get color for cost-effectiveness rating
 */
export const getCostEffectivenessColor = (costPerQaly: number, darkMode: boolean): string => {
  if (costPerQaly < 20000) return darkMode ? '#3FB950' : '#4A7C59';
  if (costPerQaly < 50000) return darkMode ? '#56D364' : '#10B981';
  if (costPerQaly < 100000) return darkMode ? '#D29922' : '#F59E0B';
  return darkMode ? '#F85149' : '#EF4444';
};

/**
 * Get color for difficulty level
 */
export const getDifficultyColor = (difficulty: string, darkMode: boolean): string => {
  const colors: Record<string, string> = {
    beginner: darkMode ? '#3FB950' : '#4A7C59',
    intermediate: darkMode ? '#D29922' : '#F59E0B',
    expert: darkMode ? '#F85149' : '#EF4444',
    master: darkMode ? '#A371F7' : '#8B5CF6',
  };
  return colors[difficulty] || (darkMode ? '#6E7681' : '#8B8B8B');
};

/**
 * Get color for budget status (over/warning/ok)
 */
export const getBudgetColor = (percentUsed: number, darkMode: boolean): string => {
  if (percentUsed > 100) return darkMode ? '#F85149' : '#EF4444';
  if (percentUsed > 80) return darkMode ? '#D29922' : '#F59E0B';
  return darkMode ? '#3FB950' : '#4A7C59';
};

/**
 * Get color for delta/change values
 */
export const getDeltaColor = (delta: number, isPositiveGood: boolean, darkMode: boolean): string => {
  const isGood = isPositiveGood ? delta > 0 : delta < 0;
  return isGood
    ? (darkMode ? '#3FB950' : '#4A7C59')
    : (darkMode ? '#F85149' : '#EF4444');
};
