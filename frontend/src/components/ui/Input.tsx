import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="form-group">
        {label && <label className="form-label">{label}</label>}
        <input
          ref={ref}
          className={`form-input ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1">{error}</p>}
        {helperText && !error && <p className="mt-1 text-[10px] text-gray-500 tracking-wider ml-1">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
