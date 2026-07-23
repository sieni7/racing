import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', className = '', children, onClick, ...props }) => {
  const base = 'relative overflow-hidden inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants: Record<string, string> = {
    primary: 'bg-primary text-white hover:bg-cta shadow-sm',
    secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  };

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ripple = document.createElement('span');
    ripple.className = 'absolute rounded-full bg-white/30 animate-ripple pointer-events-none';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = '0';
    ripple.style.height = '0';
    e.currentTarget.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
    onClick?.(e);
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
