import type { FC, LabelHTMLAttributes, PropsWithChildren } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement>, PropsWithChildren {
  required?: boolean;
}

export const Label: FC<LabelProps> = ({ className = '', required, children, ...props }) => {
  return (
    <label
      className={`block text-14-16 font-medium text-gray-700 dark:text-gray-300 mb-1 ${className}`}
      {...props}
    >
      {children}
      {required && <span className='text-red-500 ml-1'>*</span>}
    </label>
  );
};

Label.displayName = 'Label';
