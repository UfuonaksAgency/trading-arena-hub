import React from 'react';
import { ScrollReveal } from '@/hooks/useScrollReveal';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileOptimizedRevealProps {
  children: React.ReactNode;
  delay?: number;
  distance?: string;
  duration?: number;
  className?: string;
  mobileClassName?: string;
}

// Detect iOS ONCE at module load (before any React rendering)
const IS_IOS = typeof window !== 'undefined' && (
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
);

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768;

export const MobileOptimizedReveal: React.FC<MobileOptimizedRevealProps> = ({
  children,
  delay = 0,
  distance = "30px",
  duration = 600,
  className = "",
  mobileClassName = "",
}) => {
  // If iOS or mobile, return IMMEDIATELY with no hooks, no state
  if (IS_IOS || IS_MOBILE) {
    return (
      <div 
        className={`${mobileClassName} ${className}`}
        style={{ opacity: 1, visibility: 'visible' }}
      >
        {children}
      </div>
    );
  }
  
  // Desktop only: use hooks
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return (
      <div 
        className={`${mobileClassName} ${className}`}
        style={{ opacity: 1, visibility: 'visible' }}
      >
        {children}
      </div>
    );
  }

  // Desktop animations
  return (
    <ScrollReveal delay={delay} distance={distance} duration={duration} className={className}>
      {children}
    </ScrollReveal>
  );
};

export default MobileOptimizedReveal;