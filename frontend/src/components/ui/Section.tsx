import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  id?: string;
  containerClassName?: string;
  centered?: boolean;
}

const Section: React.FC<SectionProps> = ({ 
  children, 
  title, 
  subtitle, 
  className = '', 
  id,
  containerClassName = '',
  centered = false
}) => {
  return (
    <section id={id} className={`py-20 ${className}`}>
      <div className={`max-w-7xl mx-auto px-6 ${containerClassName} ${centered ? 'text-center' : ''}`}>
        {(title || subtitle) && (
          <div className={`mb-12 ${centered ? 'mx-auto' : ''}`}>
            {subtitle && (
              <span className="text-church-terracotta font-bold uppercase tracking-[.3em] text-xs mb-4 block animate-fade-in">
                {subtitle}
              </span>
            )}
            {title && (
              <h2 className="text-4xl md:text-5xl font-serif text-church-olive mb-4 animate-fade-in">
                {title}
              </h2>
            )}
            <div className={`w-20 h-1 bg-church-terracotta rounded-full ${centered ? 'mx-auto' : ''} animate-fade-in`}></div>
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;
