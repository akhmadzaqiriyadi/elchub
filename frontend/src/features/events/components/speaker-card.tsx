/**
 * Speaker Card Component
 * Shows speaker/instructor information
 */

import { Mail, Linkedin } from 'lucide-react';

interface SpeakerCardProps {
  name: string;
  title: string;
  bio: string;
  image?: string;
  email?: string;
  linkedin?: string;
  expertise: string[];
}

export function SpeakerCard({
  name,
  title,
  bio,
  image,
  email,
  linkedin,
  expertise,
}: SpeakerCardProps) {
  return (
    <div className="rounded-lg border border-primary/15 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-6 hover:shadow-lg transition-shadow">
      {/* Speaker Image */}
      {image ? (
        <img
          src={image}
          alt={name}
          className="w-full h-40 sm:h-48 object-cover rounded-lg mb-4"
        />
      ) : (
        <div className="w-full h-40 sm:h-48 bg-primary/10 dark:bg-slate-700 rounded-lg mb-4 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary/40 dark:text-slate-600 mb-2">
              {name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </div>
          </div>
        </div>
      )}

      {/* Speaker Info */}
      <h3 className="text-lg font-bold text-primary dark:text-slate-100">{name}</h3>
      <p className="text-sm text-primary/70 dark:text-slate-400 font-medium">{title}</p>

      {/* Bio */}
      <p className="text-sm text-primary/60 dark:text-slate-400 mt-3 line-clamp-3">{bio}</p>

      {/* Expertise Tags */}
      <div className="flex flex-wrap gap-2 mt-3">
        {expertise.map((exp) => (
          <span
            key={exp}
            className="text-xs bg-primary/10 dark:bg-slate-700 text-primary dark:text-slate-300 px-2 py-1 rounded"
          >
            {exp}
          </span>
        ))}
      </div>

      {/* Contact Links */}
      {(email || linkedin) && (
        <div className="flex gap-2 mt-4">
          {email && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/70 dark:text-blue-400 dark:hover:text-blue-300"
              title="Send email"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Email</span>
            </a>
          )}
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/70 dark:text-blue-400 dark:hover:text-blue-300"
              title="LinkedIn Profile"
            >
              <Linkedin className="w-4 h-4" />
              <span className="hidden sm:inline">LinkedIn</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
