import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'terracotta' | 'olive' | 'success' | 'danger' | 'gray';
  className?: string;
  size?: 'xs' | 'sm';
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'primary', 
  className = '',
  size = 'sm'
}) => {
  const variantClasses = {
    primary: 'bg-church-olive/10 text-church-olive',
    terracotta: 'bg-church-terracotta/10 text-church-terracotta',
    olive: 'bg-church-olive/10 text-church-olive',
    success: 'bg-green-50 text-green-600',
    danger: 'bg-red-50 text-red-600',
    gray: 'bg-gray-100 text-gray-600',
  };

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[8px]',
    sm: 'px-3 py-1 text-[10px]',
  };

  return (
    <span className={`inline-flex items-center font-black uppercase rounded-full tracking-widest shadow-sm ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
