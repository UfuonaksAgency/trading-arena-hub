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

  // On mobile, use simple fade-in without heavy animations
  useEffect(() => {
    if (isMobile) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isMobile, delay]);

  // On mobile, render with lightweight animation to prevent performance issues
  if (isMobile) {
    return (
      <div 
        className={`transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        } ${mobileClassName} ${className}`}
        style={{
          transitionDelay: `${delay}ms`
        }}
      >
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