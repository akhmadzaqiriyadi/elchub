/**
 * Mentor Card Component
 * Shows mentor profile with expertise and ratings
 */

interface MentorCardProps {
  id: string;
  name: string;
  title: string;
  expertise: string[];
  yearsExperience: number;
  rating: number;
  reviewCount: number;
  image?: string;
  bio: string;
  hourlyRate: number;
  availability: string;
  badge?: 'expert' | 'certified' | 'top' | 'featured';
}

const badgeStyles: Record<string, { bg: string; text: string; label: string }> = {
  expert: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', label: '⭐ Expert' },
  certified: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', label: '✓ Certified' },
  top: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400', label: '🏆 Top Mentor' },
  featured: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400', label: '💎 Featured' },
};

export function MentorCard({
  id,
  name,
  title,
  expertise,
  yearsExperience,
  rating,
  reviewCount,
  image,
  bio,
  hourlyRate,
  availability,
  badge,
}: MentorCardProps) {
  const badgeStyle = badge ? badgeStyles[badge] : null;

  return (
    <div className="rounded-lg border border-primary/15 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
      {/* Banner */}
      <div className="h-20 bg-gradient-to-r from-[#2E417B] to-blue-600 dark:from-blue-600 dark:to-blue-700" />

      {/* Content */}
      <div className="p-4 sm:p-6">
        {/* Avatar & Badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-end gap-3">
            {image ? (
              <img
                src={image}
                alt={name}
                className="w-16 h-16 rounded-full border-4 border-white dark:border-slate-800 object-cover -mt-8"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/20 dark:bg-slate-700 border-4 border-white dark:border-slate-800 -mt-8 flex items-center justify-center">
                <span className="text-xl font-bold text-primary/60 dark:text-slate-400">
                  {name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </span>
              </div>
            )}
          </div>
          {badgeStyle && (
            <span
              className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${badgeStyle.bg} ${badgeStyle.text}`}
            >
              {badgeStyle.label}
            </span>
          )}
        </div>

        {/* Name & Title */}
        <h3 className="text-lg font-bold text-primary dark:text-slate-100">{name}</h3>
        <p className="text-sm text-primary/70 dark:text-slate-400 font-medium">{title}</p>

        {/* Rating */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-sm ${i < Math.floor(rating) ? '⭐' : '☆'}`}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-primary dark:text-slate-100">
            {rating.toFixed(1)}
          </span>
          <span className="text-xs text-primary/60 dark:text-slate-400">({reviewCount} ulasan)</span>
        </div>

        {/* Bio */}
        <p className="text-sm text-primary/60 dark:text-slate-400 mt-3 line-clamp-2">{bio}</p>

        {/* Experience & Rate */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-primary/10 dark:border-slate-700">
          <div>
            <p className="text-xs text-primary/60 dark:text-slate-400">Pengalaman</p>
            <p className="text-sm font-semibold text-primary dark:text-slate-100">
              {yearsExperience}+ tahun
            </p>
          </div>
          <div>
            <p className="text-xs text-primary/60 dark:text-slate-400">Tarif/Jam</p>
            <p className="text-sm font-semibold text-primary dark:text-slate-100">
              Rp {hourlyRate.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {/* Expertise Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {expertise.slice(0, 3).map((exp) => (
            <span
              key={exp}
              className="text-xs bg-primary/10 dark:bg-slate-700 text-primary dark:text-slate-300 px-2 py-1 rounded"
            >
              {exp}
            </span>
          ))}
          {expertise.length > 3 && (
            <span className="text-xs text-primary/60 dark:text-slate-400 px-2 py-1">
              +{expertise.length - 3} lagi
            </span>
          )}
        </div>

        {/* Availability */}
        <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-3 flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
          {availability}
        </div>

        {/* View Button */}
        <button className="w-full mt-4 px-4 py-2 rounded-lg bg-[#2E417B] hover:bg-[#1f2a52] text-white dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors text-sm font-medium">
          Lihat Profil
        </button>
      </div>
    </div>
  );
}
