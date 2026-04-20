/**
 * Mentoring Stats Component
 * Shows overview stats about a mentor
 */

interface MentoringStat {
  label: string;
  value: string | number;
  icon: string;
}

interface MentoringStatsProps {
  stats: MentoringStat[];
}

export function MentoringStats({ stats }: MentoringStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-primary/15 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-center hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-2">{stat.icon}</div>
          <div className="text-lg sm:text-2xl font-bold text-primary dark:text-slate-100">
            {stat.value}
          </div>
          <div className="text-xs sm:text-sm text-primary/60 dark:text-slate-400 mt-1">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
