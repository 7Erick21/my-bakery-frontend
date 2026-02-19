import type { FC, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

const baseClass =
  'w-full px-3 py-2.5 rounded-xl border border-border-card-children-light dark:border-border-card-children-dark bg-card-children-light dark:bg-card-children-dark backdrop-blur-lg shadow-card-children-light dark:shadow-card-children-dark text-14-16 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400/50 dark:focus:border-amber-500/50 focus:shadow-md focus:shadow-amber-500/10 outline-none transition-all duration-300';

export const Input: FC<InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => {
  return <input className={`${baseClass} ${className}`} {...props} />;
};

Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea: FC<TextareaProps> = ({ className = '', rows = 3, ...props }) => {
  return <textarea className={`${baseClass} ${className}`} rows={rows} {...props} />;
};

Textarea.displayName = 'Textarea';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export const Select: FC<SelectProps> = ({ className = '', children, ...props }) => {
  return (
    <div className='relative'>
      <select
        className={`${baseClass} appearance-none pr-10 cursor-pointer ${className}`}
        {...props}
      >
        {children}
      </select>
      <svg
        className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 fill-gray-500 dark:fill-gray-400 transition-colors duration-300'
        viewBox='0 0 20 20'
        aria-hidden='true'
      >
        <path
          fillRule='evenodd'
          d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z'
          clipRule='evenodd'
        />
      </svg>
    </div>
  );
};

Select.displayName = 'Select';
