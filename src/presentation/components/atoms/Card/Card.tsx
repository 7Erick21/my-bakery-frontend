import React, { forwardRef } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'children' | 'glass' | 'glass-light' | 'glass-heavy';
}

const cardVariants: Record<NonNullable<CardProps['variant']>, string> = {
  default: `
    bg-card-light border-1 backdrop-blur-lg border-solid border-border-card-light rounded-3xl shadow-card-light  
    dark:bg-card-dark dark:border-border-card-dark dark:shadow-card-dark
  `,
  children: `
    rounded-xl bg-card-children-light backdrop-blur-lg shadow-card-children-light border border-solid border-border-card-children-light 
    dark:bg-card-children-dark dark:shadow-card-children-dark dark:border-border-card-children-dark
  `,
  glass: `
      backdrop-blur-md backdrop-saturate-180 bg-white/10 dark:bg-slate-900/20 
      border border-white/20 dark:border-white/10 
      shadow-lg shadow-black/5 dark:shadow-black/20
      hover:backdrop-blur-lg hover:backdrop-saturate-200 hover:bg-white/20 dark:hover:bg-slate-900/40
      hover:border-white/40 dark:hover:border-white/20 hover:shadow-xl overflow-hidden relative group
      
      before:content-['']
      before:absolute before:inset-0
      before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
      before:translate-x-[-100%] before:transition-transform before:duration-700
      group-hover:before:translate-x-[100%]
      pointer-events-auto
    `,
  'glass-light': `
      backdrop-blur-sm backdrop-saturate-150 bg-white/15 dark:bg-slate-900/30 
      border border-white/30 dark:border-white/15 
      shadow-md shadow-black/5 dark:shadow-black/10
      hover:backdrop-blur-md hover:backdrop-saturate-180 hover:bg-white/25 dark:hover:bg-slate-900/50
      hover:border-white/50 dark:hover:border-white/25 hover:shadow-lg overflow-hidden relative group
      
      before:content-['']
      before:absolute before:inset-0
      before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
      before:translate-x-[-100%] before:transition-transform before:duration-700
      group-hover:before:translate-x-[100%]
      pointer-events-auto
    `,
  'glass-heavy': `
      backdrop-blur-xl backdrop-saturate-200 bg-white/5 dark:bg-slate-900/10 
      border border-white/10 dark:border-white/5 
      shadow-xl shadow-black/10 dark:shadow-black/30
      hover:backdrop-blur-2xl hover:backdrop-saturate-300 hover:bg-white/10 dark:hover:bg-slate-900/20
      hover:border-white/20 dark:hover:border-white/10 hover:shadow-2xl overflow-hidden relative group
      
      before:content-['']
      before:absolute before:inset-0
      before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
      before:translate-x-[-100%] before:transition-transform before:duration-700
      group-hover:before:translate-x-[100%]
      pointer-events-auto
    `
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    const styles = cardVariants[variant];

    return (
      <div ref={ref} className={`${styles} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
