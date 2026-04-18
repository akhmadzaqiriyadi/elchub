# GSAP Scroll Animations

Dokumentasi penggunaan GSAP animations pada landing page dengan scroll trigger dan fade-up effect.

## 📦 Setup

GSAP sudah terinstall dan dikonfigurasi dalam project:

```bash
bun add gsap classnames
```

## 🎬 Implementasi Animations

### 1. useScrollAnimation Hook

Hook untuk single element fade-up animation saat scroll.

```tsx
import { useScrollAnimation } from '@/features/landing';

export function HeroSection() {
  const ref = useScrollAnimation({ 
    delay: 0,        // Delay sebelum animasi dimulai
    duration: 0.8,   // Duration animasi dalam detik
    ease: 'power2.out' // Easing function
  });

  return (
    <section ref={ref}>
      {/* Content */}
    </section>
  );
}
```

**Props:**
- `delay` - Delay in seconds (default: 0)
- `duration` - Animation duration in seconds (default: 0.8)
- `ease` - GSAP easing function (default: 'power2.out')
- `stagger` - Stagger delay untuk multiple elements (untuk useScrollAnimationStagger)

### 2. useScrollAnimationStagger Hook

Hook untuk multiple children dengan stagger effect.

```tsx
import { useScrollAnimationStagger } from '@/features/landing';

export function EventHighlightsSection({ events }) {
  const containerRef = useScrollAnimationStagger({ 
    delay: 0.1, 
    stagger: 0.15  // 150ms delay antara setiap child
  });

  return (
    <section ref={containerRef}>
      <div className="grid">
        {events.map((event) => (
          <div key={event.id} data-animate>
            <EventCard event={event} />
          </div>
        ))}
      </div>
    </section>
  );
}
```

**PENTING:** Berikan attribute `data-animate` pada setiap child element yang ingin di-animate dengan stagger.

### 3. SectionContainer dengan Animation

`SectionContainer` sudah support ref, jadi bisa langsung digunakan dengan hook:

```tsx
<SectionContainer
  background="light"
  ref={containerRef as React.RefObject<HTMLDivElement>}
>
  {/* Content */}
</SectionContainer>
```

### 4. AnimatedSection Component

Wrapper component untuk automatic fade-up animation:

```tsx
import { AnimatedSection } from '@/features/landing';

export function MyFeature() {
  return (
    <AnimatedSection delay={0.2} duration={0.8}>
      <h2>Konten yang akan di-animate</h2>
      <p>Ini akan fade-up saat scroll</p>
    </AnimatedSection>
  );
}
```

## ⚙️ Konfigurasi Animation

### Scroll Trigger Settings

Setiap animation dikonfigurasi dengan ScrollTrigger:

```tsx
scrollTrigger: {
  trigger: element,           // Element yang di-monitor
  start: 'top 80%',          // Trigger ketika top element di 80% dari viewport
  end: 'top 20%',            // End ketika top element di 20% dari viewport
  toggleActions: 'play none none none', // Play saat trigger, pause saat toggle out
  once: true,                // Hanya animate sekali
}
```

### Easing Functions

GSAP menyediakan berbagai easing:

```tsx
// Common easing functions
'power1.inOut'  // Light easing
'power2.out'    // Default, smooth deceleration
'power3.out'    // More dramatic deceleration
'power4.out'    // Very dramatic

'quad.inOut'    // Quadratic
'cubic.inOut'   // Cubic
'sine.inOut'    // Sine wave

// Bounce & Elastic
'back.out'      // Bounce back effect
'elastic.out'   // Elastic effect
'bounce.out'    // Bounce effect
```

## 🎨 Animation Details

### Default Animation Sequence

Setiap section dikonfigurasi dengan delay dan durasi yang berbeda untuk smooth cascade effect:

| Section | Delay | Duration | Stagger |
|---------|-------|----------|---------|
| Hero | 0ms | 800ms | - |
| Event Highlights | 100ms | 600ms | 150ms |
| Growth Pillars | 100ms | 600ms | 200ms |
| How It Works | 100ms | 900ms | - |
| Features | 100ms | 600ms | 150ms |
| Mentor CTA | 200ms | 800ms | - |

### Fade-Up Animation

Setiap element di-animate dengan:

1. **Initial State (sebelum trigger):**
   - `opacity: 0` (invisible)
   - `y: 30` (30px ke bawah)

2. **Final State (setelah animate):**
   - `opacity: 1` (fully visible)
   - `y: 0` (back to original position)

3. **Result:**
   - Element fade-in sambil slide-up
   - Smooth dan sophisticated look
   - Biru tua (#2E417B) background muncul perlahan

## 📱 Performance Tips

1. **Use `once: true`** - Prevent unnecessary re-animations
2. **Use `data-animate` attribute** - Only animate necessary elements
3. **ScrollTrigger optimization** - Already configured dengan minimal triggers
4. **Cleanup** - Hooks automatically cleanup GSAP context

## 🔧 Advanced Usage

### Custom Animation Duration

```tsx
const ref = useScrollAnimation({ 
  duration: 1.2,  // Lebih panjang
  ease: 'cubic.out'  // Easing lebih smooth
});
```

### Stagger dengan Control

```tsx
const ref = useScrollAnimationStagger({
  delay: 0.1,
  duration: 0.8,
  stagger: 0.25,  // Larger stagger = slower cascade
  ease: 'back.out'
});
```

### Multiple Animations pada Element

GSAP context allows multiple animations:

```tsx
gsap.context(() => {
  // First animation
  gsap.to(element1, { ... });
  
  // Second animation (runs simultaneously)
  gsap.to(element2, { ... });
}, elementRef); // Cleanup terbatas pada elementRef
```

## 🎯 Best Practices

1. **Use semantic scroll trigger points**
   - 80% dari viewport = Good timing untuk user to see
   - 20% end = Sufficient range untuk animation

2. **Match animation duration dengan content complexity**
   - Simple text: 0.6 - 0.8s
   - Cards/components: 0.8 - 1.0s
   - Complex layouts: 1.0 - 1.2s

3. **Use stagger for related items**
   - Cards dalam grid: 0.1 - 0.15s stagger
   - List items: 0.1 - 0.2s stagger

4. **Avoid too many animations**
   - Max 100ms delay antara element group
   - Total animation time < 3 detik untuk full page

## 📚 GSAP Documentation

- [GSAP Official Docs](https://gsap.com/docs/)
- [ScrollTrigger Docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [Easing Visualizer](https://gsap.com/docs/v3/Eases)

## 🚀 Future Enhancements

- [ ] Parallax scrolling effects
- [ ] Reverse animation on scroll back
- [ ] Progress bar tied to scroll
- [ ] Timeline-based animations
- [ ] SVG animations dengan GSAP
