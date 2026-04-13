import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'md'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-church-dark/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className={`bg-white rounded-[2.5rem] shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in duration-300`}
      >
        {/* Header */}
        <div className="px-10 pt-10 pb-6 flex items-center justify-between">
          <h2 className="text-3xl font-serif text-church-olive">{title}</h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-10 pb-10 overflow-y-auto flex-grow">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-10 py-6 bg-gray-50 flex justify-end gap-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
