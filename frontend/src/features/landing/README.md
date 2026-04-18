# Landing Feature Structure

Dokumentasi struktur dan cara penggunaan landing page feature sesuai dengan feature-based guide.

## 📁 Struktur Folder

```
src/features/landing/
├── components/
│   ├── ui/                           # Komponen atomics UI yang reusable
│   │   ├── badge.tsx                 # Badge komponen dengan variants
│   │   └── section-container.tsx     # Container & header untuk section
│   ├── hero-section.tsx              # Hero/splash screen
│   ├── event-card.tsx                # Card untuk single event
│   ├── event-highlights-section.tsx  # Section yang menampilkan event highlights
│   ├── pillar-card.tsx               # Card untuk growth pillar
│   ├── growth-pillars-section.tsx    # Section 3 pilar utama
│   ├── work-step.tsx                 # Card untuk workflow step
│   ├── how-it-works-section.tsx      # Section workflow
│   ├── feature-card.tsx              # Card untuk ecosystem feature
│   ├── features-section.tsx          # Section fitur-fitur unggulan
│   ├── mentor-recruitment-section.tsx # CTA mentor recruitment
│   ├── backend-status-card.tsx       # [Legacy] Status backend checker
│   └── highlight-card.tsx            # [Legacy] Highlight card lama
├── constants/
│   ├── colors.ts                     # Palet warna UCH Connection
│   └── sections-data.ts              # Data untuk setiap section (growth pillars, how it works, features)
├── types/
│   ├── event.ts                      # Type untuk Event dan variants
│   └── pillar.ts                     # Type untuk Pillar, HowItWorksStep, Feature
├── data.ts                           # [Legacy] Data lama (tetap ada untuk compatibility)
├── landing-page.tsx                  # Main page component
└── index.ts                          # Exports utama
```

## 🎨 Komponen dan Penggunaannya

### Atomic UI Components

#### Badge (`components/ui/badge.tsx`)
Digunakan untuk menampilkan label status event atau informasi kecil.

```tsx
import { Badge } from '@/features/landing';

<Badge variant="free">Free</Badge>
<Badge variant="exclusive">Exclusive</Badge>
<Badge variant="live">Live Now</Badge>
<Badge variant="success">Active</Badge>
```

**Variants:**
- `free` - untuk event gratis
- `exclusive` - untuk event eksklusif/berbayar
- `live` - untuk event yang sedang berlangsung
- `success` - untuk status sukses
- `primary` (default) - warna utama

#### SectionContainer & SectionHeader
Container untuk setiap section dan header yang konsisten.

```tsx
import { SectionContainer, SectionHeader } from '@/features/landing';

<SectionContainer background="light" size="default">
  <div className="container">
    <SectionHeader 
      title="Judul Section"
      subtitle="Subtitle penjelasan"
      centered
    />
    {/* Content */}
  </div>
</SectionContainer>
```

### Section Components

#### HeroSection
Hero/splash screen untuk landing page.

```tsx
<HeroSection 
  onCtaPrimary={() => scrollToEvents()}
  onCtaSecondary={() => navigateToRegister()}
/>
```

#### EventHighlightsSection
Menampilkan card-card event dengan status badge.

```tsx
<EventHighlightsSection 
  events={eventList}
  onEventAction={(eventId) => navigateToDetail(eventId)}
/>
```

#### GrowthPillarsSection
Menampilkan 3 pilar utama (Webinar, Mentoring, Library).

```tsx
<GrowthPillarsSection pillars={GROWTH_PILLARS} />
```

#### HowItWorksSection
Menampilkan 4 langkah workflow.

```tsx
<HowItWorksSection steps={HOW_IT_WORKS_STEPS} />
```

#### FeaturesSection
Menampilkan fitur-fitur ecosystem.

```tsx
<FeaturesSection features={ECOSYSTEM_FEATURES} />
```

#### MentorRecruitmentSection
CTA untuk mentor recruitment.

```tsx
<MentorRecruitmentSection onMentorCta={() => navigateToMentorRegister()} />
```

## 📦 Data & Constants

### colors.ts
Palet warna sesuai brand guideline UCH Connection:

```tsx
export const LANDING_COLORS = {
  primary: '#2E417B',      // Navy Blue
  background: '#FFFFFF',   // White
  lightBg: '#F1F4F9',      // Light background
  accent: '#EAB308',       // Gold/Yellow
  success: '#22C55E',      // Green
  textDark: '#1F2937',
  textMuted: '#6B7280',
  border: '#E5E7EB',
};
```

### sections-data.ts
Berisi data untuk setiap section:

```tsx
export const GROWTH_PILLARS: GrowthPillar[]     // 3 pilar utama
export const HOW_IT_WORKS_STEPS: HowItWorksStep[] // 4 step workflow
export const ECOSYSTEM_FEATURES: EcosystemFeature[] // 4 fitur ecosystem
```

## 🔗 Penggunaan di App Router

```tsx
// src/app/page.tsx
import { LandingPage } from '@/features/landing';

export default function Home() {
  return <LandingPage />;
}
```

## 📋 Type Reference

### Event
```tsx
interface Event {
  id: string;
  title: string;
  description: string;
  type: 'webinar' | 'workshop' | 'mentoring' | 'library';
  status: 'live' | 'upcoming' | 'completed';
  isFree: boolean;
  isExclusive: boolean;
  image?: string;
  date: string;
  time?: string;
  instructor?: string;
  participants?: number;
}
```

### GrowthPillar
```tsx
interface GrowthPillar {
  id: string;
  title: string;
  description: string;
  details: string[];
  icon: LucideIcon;
  benefits: string[];
}
```

## ✨ Design Features

- **Responsive Design**: Semua komponen responsive dari mobile ke desktop
- **Dark Mode Support**: Semua warna sudah support dark mode
- **Tailwind + CSS**: Menggunakan Tailwind CSS untuk styling
- **Accessibility**: Memenuhi standar WCAG dengan proper contrast ratios
- **Animation Ready**: Siap untuk integrasi GSAP animations

## 🔄 Migration dari Struktur Lama

Jika ada yang masih menggunakan komponen lama:
- `BackendStatusCard` - masih tersedia (legacy)
- `HighlightCard` - masih tersedia (legacy)
- `landingHighlights` data - masih di `data.ts` (legacy)

Untuk fitur baru, gunakan struktur yang baru dengan section components & atomic UI components.

## 🎯 Best Practices

1. **Gunakan section components** untuk setiap section utama landing
2. **Gunakan atomic UI** (Badge, SectionContainer) untuk consistency
3. **Props paling umum** adalah `className` untuk customization
4. **Callback handlers** (onAction, onCta) untuk interaksi user
5. **Leverage data constants** dari `constants/sections-data.ts`

## 📝 Catatan

- Structure mengikuti feature-based guide dari project
- Setiap section bisa digunakan secara independent
- Easy to extend dan customize dengan new data
- Ready untuk integrasi dengan backend/API calls
