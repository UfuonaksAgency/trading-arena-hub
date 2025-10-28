import { useEffect, useRef, useState } from 'react';

interface ScrollRevealOptions {
  threshold?: number;
  delay?: number;
  distance?: string;
  duration?: number;
  reset?: boolean;
}

export const useScrollReveal = (options: ScrollRevealOptions = {}) => {
  const {
    threshold = 0.1,
    delay = 0,
    distance = '30px',
    duration = 800,
    reset = false
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Detect iOS and mobile early
    const isIOS = typeof window !== 'undefined' && (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
    const isMobileViewport = typeof window !== 'undefined' && window.innerWidth < 768;

    // On iOS or mobile, set visible immediately and exit (no observer, no inline styles)
    if (isIOS || isMobileViewport) {
      setIsVisible(true);
      if (!reset) setHasAnimated(true);
      return;
    }

    // Emergency timeout - force visibility after 200ms
    const emergencyTimeout = setTimeout(() => {
      if (!isVisible && (!hasAnimated || reset)) {
        console.log('[iOS Emergency] Forcing visibility after 200ms timeout');
        setIsVisible(true);
        if (!reset) setHasAnimated(true);
      }
    }, 200);

    // Safety timeout to prevent blank screens if IntersectionObserver fails
    const safetyTimeout = setTimeout(() => {
      if (!isVisible && (!hasAnimated || reset)) {
        setIsVisible(true);
        if (!reset) setHasAnimated(true);
      }
    }, 500);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!hasAnimated || reset) {
            setTimeout(() => {
              setIsVisible(true);
              if (!reset) setHasAnimated(true);
            }, delay);
          }
        } else if (reset) {
          setIsVisible(false);
        }
      },
      { threshold: 0.1 } // iOS-compatible threshold (0.1 instead of 0.000001)
    );

    observer.observe(element);

    return () => {
      clearTimeout(emergencyTimeout);
      clearTimeout(safetyTimeout);
      observer.disconnect();
    };
  }, [threshold, delay, reset, hasAnimated, isVisible]);

  const style = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : `translateY(${distance})`,
    WebkitTransform: isVisible ? 'translateY(0) translateZ(0)' : `translateY(${distance}) translateZ(0)`,
    transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
    WebkitTransition: `opacity ${duration}ms ease-out, -webkit-transform ${duration}ms ease-out`,
  };

  return { ref: elementRef, style, isVisible };
};

// Component wrapper for easy usage
interface ScrollRevealProps extends ScrollRevealOptions {
  children: React.ReactNode;
  className?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  ...options
}) => {
  const { ref, style } = useScrollReveal(options);

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
};

export default ScrollReveal;