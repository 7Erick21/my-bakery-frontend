'use client';

import type { FC } from 'react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const Checkbox: FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = ''
}) => {
  return (
    <label
      className={`inline-flex items-center gap-3 select-none group ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      <input
        type='checkbox'
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled}
        className='sr-only peer'
      />
      {/* Track */}
      <span
        className={`relative inline-flex w-12 h-7 shrink-0 rounded-full border transition-all duration-300 ${
          checked
            ? 'bg-linear-to-r from-amber-400/30 via-amber-500/30 to-orange-500/30 border-amber-400/50 shadow-md shadow-amber-500/25'
            : 'bg-card-children-light dark:bg-card-children-dark border-border-card-children-light dark:border-border-card-children-dark shadow-card-children-light dark:shadow-card-children-dark'
        } ${!disabled ? 'group-hover:shadow-lg group-hover:shadow-amber-500/15' : ''}`}
      >
        {/* Knob */}
        <span
          className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full shadow-md transition-all duration-300 ${
            checked
              ? 'translate-x-5 bg-white shadow-amber-900/20'
              : 'translate-x-0 bg-white dark:bg-gray-200 shadow-black/10'
          }`}
        />
      </span>
      {label && (
        <span className='text-14-16 text-gray-700 dark:text-gray-300 transition-colors duration-300'>
          {label}
        </span>
      )}
    </label>
  );
};

Checkbox.displayName = 'Checkbox';
