import { useEffect, useRef, useState } from 'react';

/**
 * Hook otimizado para animar um único valor numérico com throttling de estado
 * para evitar re-renderizações excessivas durante o arraste do slider.
 */
export function useAnimatedNumber(targetValue: number, durationMs = 150): number {
  const [displayValue, setDisplayValue] = useState<number>(targetValue);
  const startValueRef = useRef<number>(targetValue);
  const currentValueRef = useRef<number>(targetValue);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (Math.abs(targetValue - currentValueRef.current) < 0.01) {
      if (displayValue !== targetValue) {
        setDisplayValue(targetValue);
      }
      currentValueRef.current = targetValue;
      return;
    }

    startValueRef.current = currentValueRef.current;
    let startTime: number | null = null;
    let lastUpdate = 0;

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      if (progress >= 1) {
        currentValueRef.current = targetValue;
        setDisplayValue(targetValue);
        return;
      }

      // Atualiza o React no máximo a cada ~30ms durante a transição
      if (timestamp - lastUpdate >= 30) {
        lastUpdate = timestamp;
        const eased = 1 - (1 - progress) * (1 - progress);
        const nextValue =
          startValueRef.current + (targetValue - startValueRef.current) * eased;
        currentValueRef.current = nextValue;
        setDisplayValue(nextValue);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [targetValue, durationMs]);

  return displayValue;
}
