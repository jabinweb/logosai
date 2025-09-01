import React from 'react';

interface LogosAIFaviconProps {
  size?: number;
}

const LogosAIFavicon: React.FC<LogosAIFaviconProps> = ({ size = 32 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none"
    >
      {/* Background */}
      <rect width="32" height="32" rx="8" fill="#2563eb"/>
      
      {/* Open book outline */}
      <rect 
        x="6" 
        y="8" 
        width="20" 
        height="16" 
        rx="2" 
        stroke="white" 
        strokeWidth="2" 
        fill="none"
      />
      
      {/* Center spine */}
      <path 
        d="M16 8v16" 
        stroke="white" 
        strokeWidth="2"
      />
      
      {/* Text lines on left */}
      <path 
        d="M10 12h4M10 16h4M10 20h3" 
        stroke="white" 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
      
      {/* AI dots on right */}
      <circle cx="20" cy="13" r="1.5" fill="white"/>
      <circle cx="22" cy="16" r="1.5" fill="white"/>
      <circle cx="20" cy="19" r="1.5" fill="white"/>
      
      {/* Connection lines */}
      <path 
        d="M20 14.5l2 1.5M22 17.5l-2 1.5" 
        stroke="white" 
        strokeWidth="1" 
        strokeLinecap="round"
      />
    </svg>
  );
};

export default LogosAIFavicon;
