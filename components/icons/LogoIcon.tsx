
import React from 'react';

export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#60a5fa' }} /> 
        <stop offset="100%" style={{ stopColor: '#3b82f6' }} />
      </linearGradient>
      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#3b82f6' }} />
        <stop offset="100%" style={{ stopColor: '#2563eb' }} />
      </linearGradient>
    </defs>
    <path d="M4 4H12V7H7V17H12V20H4V4Z" fill="url(#grad1)" />
    <path d="M20 12L12 4V9L15 12L12 15V20L20 12Z" fill="url(#grad2)" />
  </svg>
);
