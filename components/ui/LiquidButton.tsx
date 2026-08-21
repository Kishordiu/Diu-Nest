import React from 'react';

interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'ghost' | 'ghost-amber' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  'data-cursor'?: string;
}

export function LiquidButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: LiquidButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center font-medium font-['Inter'] tracking-wider transition-all duration-200 rounded-sm overflow-hidden active:scale-[0.98]";
  
  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const variantStyles = {
    primary: "bg-[#39FF88]/15 border border-[#39FF88] text-[#39FF88] hover:bg-[#39FF88]/25 hover:shadow-[0_0_15px_rgba(57,255,136,0.3)]",
    ghost: "bg-transparent border border-[#39FF88]/30 text-white hover:border-[#39FF88]/60",
    'ghost-amber': "bg-transparent border border-amber-500/50 text-amber-500 hover:border-amber-500",
    danger: "bg-transparent border border-red-500/50 text-red-500 hover:bg-red-500/10"
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}
