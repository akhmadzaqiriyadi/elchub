import { Layers3, Sparkles, TerminalSquare } from 'lucide-react';

export const landingHighlights = [
  {
    title: 'App Router siap pakai',
    description: 'Struktur route, layout, dan metadata sudah disiapkan untuk scale-up.',
    icon: Layers3,
  },
  {
    title: 'Styling tokenized',
    description: 'Tailwind + CSS variables bikin tema gampang diubah tanpa bongkar komponen.',
    icon: Sparkles,
  },
  {
    title: 'Siap dikembangkan',
    description: 'Ada alias path, utility class merger, dan base UI component untuk mulai cepat.',
    icon: TerminalSquare,
  },
] as const;