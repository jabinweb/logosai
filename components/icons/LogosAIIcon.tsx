import React from 'react';

interface LogosAIIconProps {
  className?: string;
  size?: number;
}

const LogosAIIcon: React.FC<LogosAIIconProps> = ({ 
  className = "w-6 h-6", 
  size = 24 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      {/* Simple, clean design - open book with modern twist */}
      <path 
        d="M4 6v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2z" 
        stroke="currentColor" 
        strokeWidth="2" 
        fill="none"
      />
      
      {/* Center fold/spine */}
      <path 
        d="M12 4v16" 
        stroke="currentColor" 
        strokeWidth="2"
      />
      
      {/* Simple text lines on left */}
      <path 
        d="M7 8h3M7 11h3M7 14h2" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
      
      {/* Modern AI symbol on right - just three connected dots */}
      <circle cx="15" cy="9" r="1" fill="currentColor"/>
      <circle cx="17" cy="12" r="1" fill="currentColor"/>
      <circle cx="15" cy="15" r="1" fill="currentColor"/>
      
      <path 
        d="M15 10l2 2M17 13l-2 2" 
        stroke="currentColor" 
        strokeWidth="1" 
        strokeLinecap="round"
      />
    </svg>
  );
};

export default LogosAIIcon;
