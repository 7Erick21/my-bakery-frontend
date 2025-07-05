import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          relative inline-flex items-center justify-center 
          rounded-xl text-sm font-medium cursor-pointer overflow-hidden
          backdrop-blur-md 

          bg-red dark:bg-bg-button-dark
          shadow-button-light dark:shadow-button-dark
          border border-solid border-button-light dark:border-button-dark

          hover:bg-button-inner-light dark:hover:bg-button-inner-dark
          hover:scale-105 focus:scale-105 transition-transform duration-150 ease-in-out

          before:absolute before:inset-0 before:rounded-[inherit] before:-z-10
          before:bg-button-inner-light dark:before:bg-button-inner-dark
          before:transition-all before:duration-300 before:ease-in-out

          /* ✨ Gradiente diagonal bakery desde bakery-700 */
          after:absolute after:inset-0 after:rounded-[inherit] after:z-0
          after:bg-[linear-gradient(to_right,_rgba(184,68,11,0.1)_0%,_rgba(222,90,10,0.08)_35%,_rgba(241,146,52,0.05)_60%,_transparent_90%)]
          after:opacity-0 hover:after:opacity-100
          after:transition-opacity after:duration-300 after:ease-in-out
          /* 🔧 Fin del gradiente */

          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
