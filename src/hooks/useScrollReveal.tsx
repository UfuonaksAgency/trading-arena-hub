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

    // Safety timeout to prevent blank screens if IntersectionObserver fails
    const safetyTimeout = setTimeout(() => {
      if (!isVisible && (!hasAnimated || reset)) {
        setIsVisible(true);
        if (!reset) setHasAnimated(true);
      }
    }, 2000);

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
      { threshold }
    );

    observer.observe(element);

    return () => {
      clearTimeout(safetyTimeout);
      observer.disconnect();
    };
  }, [threshold, delay, reset, hasAnimated, isVisible]);

  const style = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : `translateY(${distance})`,
    transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
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