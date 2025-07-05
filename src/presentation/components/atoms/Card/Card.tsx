import React, { forwardRef } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'children';
}

const cardVariants: Record<NonNullable<CardProps['variant']>, string> = {
  default: `
    bg-card-light border-1 backdrop-blur-lg border-solid border-border-card-light rounded-3xl shadow-card-light  
    dark:bg-card-dark dark:border-border-card-dark dark:shadow-card-dark
  `,
  children: `
    rounded-xl bg-card-children-light backdrop-blur-lg shadow-card-children-light border border-solid border-border-card-children-light 
    dark:bg-card-children-dark dark:shadow-card-children-dark dark:border-border-card-children-dark
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
