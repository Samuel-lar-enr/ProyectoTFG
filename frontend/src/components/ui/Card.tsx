import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick, hover = true }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm transition-all duration-300 ${hover ? 'hover:shadow-lg hover:-translate-y-1' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
