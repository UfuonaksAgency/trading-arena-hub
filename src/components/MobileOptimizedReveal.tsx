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
  const [isVisible, setIsVisible] = useState(false);

  // On mobile, use simple static rendering to prevent performance issues
  useEffect(() => {
    if (isMobile) {
      // Immediate visibility on mobile to prevent black screens
      setIsVisible(true);
    }
  }, [isMobile]);

  // On mobile, render without any animations for better performance
  if (isMobile) {
    return (
      <div className={`${mobileClassName} ${className}`}>
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