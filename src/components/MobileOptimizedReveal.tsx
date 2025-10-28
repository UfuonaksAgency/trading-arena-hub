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
  const isMobile = useIsMobile();
  
  // Detect iOS specifically
  const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  // On mobile OR iOS, render immediately without any animations
  if (isMobile || isIOS) {
    return (
      <div 
        className={`${mobileClassName} ${className}`} 
        style={{ 
          opacity: 1,
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
        }}
      >
        {children}
      </div>
    );
  }

  // Desktop uses ScrollReveal
  return (
    <ScrollReveal delay={delay} distance={distance} duration={duration} className={className}>
      {children}
    </ScrollReveal>
  );
};

export default MobileOptimizedReveal;