import React from 'react';

export default function LoadingSpinner({ message = 'Loading...', size = 'md' }) {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div
        className={`animate-spin rounded-full border-2 border-[#ECFDF5] border-t-[#087F5B] border-r-[#087F5B] ${sizeClasses[size] || sizeClasses.md}`}
      ></div>
      {message && <p className="text-xs text-[#64736A] font-semibold tracking-wide">{message}</p>}
    </div>
  );
}
