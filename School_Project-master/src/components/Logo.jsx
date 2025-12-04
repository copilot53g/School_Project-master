import React from "react";

export function Logo({ className = "", variant = "default" }) {
  const primaryColor = variant === "white" ? "#FFFFFF" : "#0F4C81";
  const accentColor = variant === "white" ? "#FFFFFF" : "#FF6B35";
  
  return (
    <svg
      className={className}
      viewBox="0 0 200 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Number 7 with geometric design */}
      <path
        d="M15 10 L45 10 L45 15 L25 15 L35 50 L28 50 L18 15 L15 15 Z"
        fill={accentColor}
      />
      
      {/* Circular emblem around the 7 */}
      <circle cx="30" cy="30" r="22" stroke={primaryColor} strokeWidth="2" fill="none" opacity="0.3"/>
      
      {/* VEDA text */}
      <text
        x="60"
        y="35"
        fontFamily="Arial, sans-serif"
        fontSize="28"
        fontWeight="700"
        fill={primaryColor}
        letterSpacing="1"
      >
        VEDA
      </text>
      
      {/* Management text */}
      <text
        x="60"
        y="50"
        fontFamily="Arial, sans-serif"
        fontSize="11"
        fontWeight="400"
        fill={primaryColor}
        letterSpacing="3"
        opacity="0.7"
      >
        MANAGEMENT
      </text>
      
      {/* Decorative dots */}
      <circle cx="155" cy="30" r="2" fill={accentColor}/>
      <circle cx="162" cy="30" r="2" fill={accentColor} opacity="0.6"/>
      <circle cx="169" cy="30" r="2" fill={accentColor} opacity="0.3"/>
    </svg>
  );
}

export function LogoIcon({ className = "", variant = "default" }) {
  const primaryColor = variant === "white" ? "#FFFFFF" : "#0F4C81";
  const accentColor = variant === "white" ? "#FFFFFF" : "#FF6B35";
  const bgColor = variant === "white" ? "#0F4C81" : "#FFFFFF";
  
  return (
    <svg
      className={className}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Background */}
      <rect width="80" height="80" rx="16" fill={bgColor}/>
      
      {/* Circular design */}
      <circle cx="40" cy="40" r="28" stroke={primaryColor} strokeWidth="2.5" fill="none" opacity="0.2"/>
      <circle cx="40" cy="40" r="22" stroke={primaryColor} strokeWidth="2" fill="none" opacity="0.4"/>
      
      {/* Number 7 */}
      <path
        d="M25 25 L55 25 L55 30 L35 30 L45 60 L38 60 L28 30 L25 30 Z"
        fill={accentColor}
      />
      
      {/* Small accent circle */}
      <circle cx="56" cy="24" r="3" fill={accentColor}/>
    </svg>
  );
}

export default Logo;
