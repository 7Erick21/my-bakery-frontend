import { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, PropsWithChildren {
  variant?: 'default' | 'outline' | 'ghost' | 'glass';
}

export const Button: FC<ButtonProps> = ({
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const baseStyles =
    'cursor-pointer inline-flex items-center justify-center rounded-xl font-medium transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    default:
      'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 border-0 hover:from-amber-600 hover:via-amber-700 hover:to-orange-700 hover:shadow-xl hover:scale-105 hover:shadow-amber-500/25 active:scale-95 active:from-amber-700 active:via-amber-800 active:to-orange-800 shadow-lg shadow-amber-500/20 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] before:transition-transform before:duration-700 hover:before:translate-x-[100%]',
    outline:
      'border-2 border-amber-600 hover:bg-amber-50 hover:border-amber-700 dark:hover:bg-amber-950/20 dark:border-amber-500 dark:hover:border-amber-400 hover:scale-105 active:scale-95 shadow-sm',
    ghost:
      'bg-transparent border border-transparent border-border-card-light hover:bg-gray-300/50 dark:hover:bg-gray-600/50 dark:border-border-card-dark hover:scale-105 active:scale-95',
    glass:
      'backdrop-blur-md backdrop-saturate-180 bg-amber-600/20 border border-amber-600/30 font-semibold hover:backdrop-blur-lg hover:backdrop-saturate-200 hover:bg-amber-600/30 hover:border-amber-600/50 hover:scale-105 hover:-translate-y-0.5 active:scale-95 shadow-lg hover:shadow-xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] before:transition-transform before:duration-700 hover:before:translate-x-[100%] dark:bg-amber-600/15 dark:border-amber-500/20 dark:hover:bg-amber-600/25 dark:hover:border-amber-500/40'
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

Button.displayName = 'Button';
