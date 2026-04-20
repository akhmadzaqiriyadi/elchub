'use client';

import gsap from 'gsap';
import { useEffect, useRef } from 'react';

interface UseAuthFormAnimationOptions {
  delay?: number;
  duration?: number;
}

/**
 * Hook for fade-up animation of auth forms on mount
 * Used in auth pages for consistent entrance animation
 */
export function useAuthFormAnimation(options: UseAuthFormAnimationOptions = {}) {
  const { delay = 0, duration = 0.8 } = options;
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!formRef.current) return;

    // Set initial state
    gsap.set(formRef.current, {
      opacity: 0,
      y: 30,
    });

    // Animate in
    gsap.to(formRef.current, {
      opacity: 1,
      y: 0,
      duration,
      ease: 'power2.out',
      delay,
    });

    // Cleanup
    return () => {
      gsap.killTweensOf(formRef.current);
    };
  }, [delay, duration]);

  return formRef;
}
