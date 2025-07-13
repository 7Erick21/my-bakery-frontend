import React, { forwardRef } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'children' | 'glass' | 'glass-light' | 'glass-heavy';
}

const cardVariants: Record<NonNullable<CardProps['variant']>, string> = {
  default: `
    bg-card-light border-1 backdrop-blur-lg border-solid rounded-3xl shadow-card-children-light border border-solid border-border-card-children-light
    dark:bg-card-dark dark:border-border-card-dark dark:shadow-card-dark
  `,
  children: `
    rounded-xl bg-card-children-light backdrop-blur-lg shadow-card-children-light border border-solid border-border-card-children-light 
    dark:bg-card-children-dark dark:shadow-card-children-dark dark:border-border-card-children-dark
  `,
  glass: `
    overflow-hidden relative group backdrop-blur-md backdrop-saturate-180 bg-white/10 shadow-md shadow-card-children-light border border-solid border-border-card-children-light 
    dark:bg-slate-900/20 dark:border-white/10 dark:shadow-black/20
    hover:backdrop-blur-lg hover:backdrop-saturate-200 hover:bg-white/20 dark:hover:bg-slate-900/40
    hover:border-white/40 dark:hover:border-white/20 hover:shadow-xl
    `,
  'glass-light': `
    overflow-hidden relative group backdrop-blur-sm backdrop-saturate-150 bg-amber-100/15 dark:bg-amber-900/10
    border border-white/30 dark:border-white/15 
    shadow-md shadow-black/5 dark:shadow-black/10
    hover:backdrop-blur-md hover:backdrop-saturate-180 
    hover:border-white/50 dark:hover:border-white/25 hover:shadow-lg
    `,
  'glass-heavy': `
    overflow-hidden relative group rounded-xl bg-card-children-light backdrop-blur-lg shadow-card-children-light border border-solid border-border-card-children-light 
    dark:bg-card-children-dark dark:shadow-card-children-dark dark:border-border-card-children-dark
    `
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    const styles = cardVariants[variant];

    return (
      <div ref={ref} className={`${styles} ${className}`} {...props}>
        {!(variant === 'children' || variant === 'default') && (
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] transition-transform duration-700 group-hover:translate-x-[100%] pointer-events-none' />
        )}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
