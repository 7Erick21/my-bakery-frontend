import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'default' | 'filled' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className = '', variant = 'default', ...props }, ref) => {
    const baseStyles = `
      relative inline-flex items-center justify-center 
          rounded-xl text-sm font-medium cursor-pointer overflow-hidden
          backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
      backdrop-blur-md transition-transform duration-300 ease-in-out
    `;

    const beforeBase = `
      before:absolute before:inset-0 before:rounded-[inherit] before:-z-10
          before:bg-button-inner-light dark:before:bg-button-inner-dark
          before:transition-all before:duration-300 before:ease-in-out
    `;

    const afterBase = `after:absolute after:inset-0 after:rounded-[inherit] after:z-0
          after:bg-[linear-gradient(to_right,_rgba(184,68,11,0.1)_0%,_rgba(222,90,10,0.08)_35%,_rgba(241,146,52,0.05)_60%,_transparent_90%)]
          after:opacity-0 hover:after:opacity-100
          after:transition-opacity after:duration-300 after:ease-in-out`;

    let variantStyles = '';

    switch (variant) {
      case 'default':
        variantStyles = `
          bg-red dark:bg-bg-button-dark
          shadow-button-light dark:shadow-button-dark
          border border-solid border-button-light dark:border-button-dark
          ${beforeBase} ${afterBase}
          before:bg-gradient-to-br before:from-[#fffaf3] before:to-[#f9e8d2]
          dark:before:from-[#3b2f2f] dark:before:to-[#2a1f1c]
          hover:shadow-lg
          hover:scale-105
        `;
        break;
      case 'filled':
        variantStyles = `
          bg-bakery-300/80 shadow-md
          dark:bg-amber-400/30
          before:bg-transparent
          hover:bg-bakery-300 dark:hover:bg-amber-500/40
          hover:shadow-lg hover:scale-105
        `;
        break;
      case 'outline':
        variantStyles = `
          border border-amber-500
          dark:border-amber-400
          before:bg-transparent
          hover:bg-amber-100/20 dark:hover:bg-amber-400/10
          hover:scale-105
        `;
        break;
    }

    return (
      <button ref={ref} className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
