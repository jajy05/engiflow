import React from 'react';

export const DwgIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth={1}
    {...props}
  >
    <path
      fill="#64748b"
      stroke="#64748b"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8l6 5z"
    />
    <path
      fill="#cbd5e1"
      stroke="#cbd5e1"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13 3v5h6"
    />
    <text
      x="12"
      y="17"
      fontFamily="sans-serif"
      fontSize="6"
      fontWeight="bold"
      fill="#cbd5e1"
      textAnchor="middle"
    >
      DWG
    </text>
  </svg>
);