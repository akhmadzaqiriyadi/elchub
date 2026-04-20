/**
 * Mentoring Level Badge Component
 * Shows skill level badge
 */

type LevelType = 'beginner' | 'intermediate' | 'advanced' | 'expert';

interface MentoringLevelProps {
  level: LevelType;
  label?: string;
}

const levelStyles: Record<LevelType, { bg: string; text: string; label: string }> = {
  beginner: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', label: '🟢 Beginner' },
  intermediate: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', label: '🔵 Intermediate' },
  advanced: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', label: '🟠 Advanced' },
  expert: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', label: '🔴 Expert' },
};

export function MentoringLevel({ level, label }: MentoringLevelProps) {
  const style = levelStyles[level];

  return (
    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${style.bg} ${style.text}`}>
      {label || style.label}
    </span>
  );
}
