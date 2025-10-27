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

  // On mobile, render immediately without any animations or state management
  if (isMobile) {
    return (
      <div className={`${mobileClassName} ${className}`} style={{ opacity: 1 }}>
        {children}
      </div>
    );
  }

  // On desktop, use full ScrollReveal functionality
  return (
    <ScrollReveal delay={delay} distance={distance} duration={duration} className={className}>
      {children}
    </ScrollReveal>
  );
};

export default MobileOptimizedReveal;