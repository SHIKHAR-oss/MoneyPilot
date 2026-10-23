import React from 'react';

export default function Badge({ children, variant = 'default', size = 'sm' }) {
  const variantStyles = {
    default: 'bg-[#F4F8F5] text-[#64736A] border-[#E0E8E2]',
    success: 'bg-[#ECFDF5] text-[#087F5B] border-[#A7F3D0]',
    warning: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
    danger: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
    info: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
    purple: 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]'
  };

  const sizeStyles = {
    xs: 'px-2 py-0.5 text-[11px] font-semibold',
    sm: 'px-2.5 py-1 text-xs font-semibold',
    md: 'px-3 py-1.5 text-sm font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size] || sizeStyles.sm}`}
    >
      {children}
    </span>
  );
}
