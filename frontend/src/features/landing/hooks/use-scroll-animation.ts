import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

interface UseScrollAnimationProps {
  delay?: number;
  duration?: number;
  stagger?: number;
  ease?: string;
}

/**
 * Custom hook untuk animasi fade-up saat element masuk viewport
 * Menggunakan GSAP ScrollTrigger untuk smooth scroll animation
 */
export function useScrollAnimation({
  delay = 0,
  duration = 0.8,
  stagger = 0.1,
  ease = 'power2.out',
}: UseScrollAnimationProps = {}) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    // Set initial state
    gsap.set(elementRef.current, {
      opacity: 0,
      y: 30,
    });

    // Create animation trigger
    const ctx = gsap.context(() => {
      gsap.to(elementRef.current, {
        opacity: 1,
        y: 0,
        duration,
        ease,
        delay,
        scrollTrigger: {
          trigger: elementRef.current,
          start: 'top 80%', // Trigger when element is 80% from top of viewport
          end: 'top 20%',
          toggleActions: 'play none none none',
          once: true, // Only animate once
        },
      });
    });

    return () => ctx.revert(); // Cleanup
  }, [delay, duration, ease]);

  return elementRef;
}

/**
 * Hook untuk animasi multiple children elements dengan stagger effect
 */
export function useScrollAnimationStagger({
  delay = 0,
  duration = 0.6,
  stagger = 0.1,
  ease = 'power2.out',
}: UseScrollAnimationProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const children = containerRef.current.querySelectorAll('[data-animate]');
    if (children.length === 0) return;

    // Set initial state untuk semua children
    gsap.set(children, {
      opacity: 0,
      y: 30,
    });

    // Create animation trigger
    const ctx = gsap.context(() => {
      gsap.to(children, {
        opacity: 1,
        y: 0,
        duration,
        ease,
        stagger,
        delay,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          end: 'top 20%',
          toggleActions: 'play none none none',
          once: true,
        },
      });
    });

    return () => ctx.revert();
  }, [delay, duration, stagger, ease]);

  return containerRef;
}
