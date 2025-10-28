import React, { useEffect, useState } from 'react';
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

export const MobileOptimizedReveal: React.FC<MobileOptimizedRevealProps> = ({
  children,
  delay = 0,
  distance = "30px",
  duration = 600,
  className = "",
  mobileClassName = "",
}) => {
  // CRITICAL: Detect iOS BEFORE any hook calls to prevent animation system from running
  const isIOS = typeof window !== 'undefined' && (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
  
  // On iOS, return immediately without calling any hooks or applying styles
  if (isIOS) {
    return <div className={`${mobileClassName} ${className}`}>{children}</div>;
  }
  
  // Only call hooks for non-iOS devices
  const isMobile = useIsMobile();
  
  // On mobile (non-iOS), render immediately without animations
  if (isMobile) {
    return <div className={`${mobileClassName} ${className}`}>{children}</div>;
  }

  // Desktop uses ScrollReveal
  return (
    <ScrollReveal delay={delay} distance={distance} duration={duration} className={className}>
      {children}
    </ScrollReveal>
  );
};

export default MobileOptimizedReveal;