import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SmoothLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const SmoothLink: React.FC<SmoothLinkProps> = ({ 
  href, 
  children, 
  className = '', 
  onClick 
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (onClick) {
      onClick();
    }

    setIsTransitioning(true);

    // Create transition overlay
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-50 bg-gradient-to-br from-blue-600 to-purple-600 opacity-0 transition-opacity duration-300';
    overlay.innerHTML = `
      <div class="flex items-center justify-center h-full">
        <div class="text-center">
          <div class="relative mb-4">
            <div class="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <div class="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-white rounded-full animate-spin" style="animation-direction: reverse; animation-duration: 1.5s;"></div>
          </div>
          <p class="text-white text-lg font-medium animate-pulse">Navigating...</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Trigger fade in
    setTimeout(() => {
      overlay.style.opacity = '1';
    }, 10);

    // Navigate after transition
    setTimeout(() => {
      router.push(href);
      
      // Remove overlay after navigation
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
        setIsTransitioning(false);
      }, 300);
    }, 400);
  };

  return (
    <Link 
      href={href} 
      className={`${className} ${isTransitioning ? 'pointer-events-none' : ''}`}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
};

export default SmoothLink;