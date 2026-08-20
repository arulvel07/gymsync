import { useState, useEffect, useRef } from 'react';

/**
 * Smoothly interpolates a numeric value from its current state to a target value over a given duration.
 * Respects prefers-reduced-motion and performs clean frame cleanup.
 */
export function useAnimatedNumber(targetValue: number, durationMs = 350): number {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef<number>(targetValue);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || durationMs <= 0 || startValueRef.current === targetValue) {
      setDisplayValue(targetValue);
      startValueRef.current = targetValue;
      return;
    }

    const startVal = startValueRef.current;
    const changeInVal = targetValue - startVal;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / durationMs, 1);

      // Smooth easeOutCubic curve: 1 - Math.pow(1 - progress, 3)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const nextVal = Math.round(startVal + changeInVal * easeProgress);

      setDisplayValue(nextVal);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
        startValueRef.current = targetValue;
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [targetValue, durationMs]);

  return displayValue;
}
