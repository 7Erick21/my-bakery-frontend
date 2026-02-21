'use client';

import { type FC, useCallback, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { es } from 'react-day-picker/locale';
import { useClickOutside } from '@/shared/hooks/useClickOutside';

const baseClass =
  'w-full px-3 py-2.5 rounded-xl border border-border-card-children-light dark:border-border-card-children-dark bg-card-children-light dark:bg-card-children-dark backdrop-blur-lg shadow-card-children-light dark:shadow-card-children-dark text-14-16 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400/50 dark:focus:border-amber-500/50 focus:shadow-md focus:shadow-amber-500/10 outline-none transition-all duration-300';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  max?: string;
  min?: string;
  className?: string;
}

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const DatePicker: FC<DatePickerProps> = ({ value, onChange, max, min, className = '' }) => {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);
  const wrapperRef = useClickOutside({ callback: close });

  const selected = parseDate(value);
  const maxDate = max ? parseDate(max) : undefined;
  const minDate = min ? parseDate(min) : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(formatDate(date));
      close();
    }
  };

  const displayValue = selected.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        type='button'
        onClick={() => setOpen(prev => !prev)}
        className={`${baseClass} appearance-none pr-10 cursor-pointer text-left`}
      >
        <span>{displayValue}</span>

        <svg
          className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5'
          />
        </svg>
      </button>

      {open && (
        <div className='absolute z-9999 mt-1.5 rounded-xl border border-border-card-children-light dark:border-border-card-children-dark bg-modal-light dark:bg-modal-dark backdrop-blur-3xl shadow-xl shadow-black/15 dark:shadow-black/40 animate-scale-in origin-top'>
          <DayPicker
            animate
            mode='single'
            locale={es}
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={selected}
            disabled={[
              ...(maxDate ? [{ after: maxDate }] : []),
              ...(minDate ? [{ before: minDate }] : [])
            ]}
            classNames={{
              root: 'rdp-bakery',
              today: 'rdp-bakery-today',
              selected: 'rdp-bakery-selected',
              disabled: 'rdp-bakery-disabled',
              chevron: 'rdp-bakery-chevron'
            }}
          />
        </div>
      )}
    </div>
  );
};

DatePicker.displayName = 'DatePicker';
