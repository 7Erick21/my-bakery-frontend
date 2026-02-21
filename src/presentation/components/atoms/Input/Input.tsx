'use client';

import {
  type FC,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import { useClickOutside } from '@/shared/hooks/useClickOutside';

const baseClass =
  'w-full px-3 py-3 rounded-xl border border-border-card-children-light dark:border-border-card-children-dark bg-card-children-light dark:bg-card-children-dark backdrop-blur-lg shadow-card-children-light dark:shadow-card-children-dark text-14-16 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400/50 dark:focus:border-amber-500/50 focus:shadow-md focus:shadow-amber-500/10 outline-none transition-all duration-300';

export const Input: FC<InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => {
  return <input className={`${baseClass} ${className}`} {...props} />;
};

Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea: FC<TextareaProps> = ({ className = '', rows = 3, ...props }) => {
  return <textarea className={`${baseClass} ${className}`} rows={rows} {...props} />;
};

Textarea.displayName = 'Textarea';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
}

export const Select: FC<SelectProps> = ({
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder = 'Seleccionar...',
  required,
  disabled,
  name,
  id,
  className = ''
}) => {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const currentValue = isControlled ? controlledValue : internalValue;

  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setHighlightedIndex(-1);
  }, []);

  const wrapperRef = useClickOutside({ callback: close });

  const selectedOption = options.find(o => o.value === currentValue);

  const selectValue = (val: string) => {
    if (!isControlled) setInternalValue(val);
    onChange?.(val);
    close();
  };

  useEffect(() => {
    if (!open || highlightedIndex < 0) return;
    const item = listRef.current?.children[highlightedIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex, open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        close();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!open) {
          setOpen(true);
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex(i => (i + 1) % options.length);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (open) {
          setHighlightedIndex(i => (i - 1 + options.length) % options.length);
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!open) {
          setOpen(true);
          setHighlightedIndex(options.findIndex(o => o.value === currentValue));
        } else if (highlightedIndex >= 0) {
          selectValue(options[highlightedIndex].value);
        }
        break;
    }
  };

  return (
    <div ref={wrapperRef} className='relative'>
      {name && <input type='hidden' name={name} value={currentValue} />}

      <button
        type='button'
        id={id}
        role='combobox'
        aria-expanded={open}
        aria-haspopup='listbox'
        disabled={disabled}
        className={`${baseClass} appearance-none pr-10! cursor-pointer text-left ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        onClick={() => !disabled && setOpen(prev => !prev)}
        onKeyDown={handleKeyDown}
      >
        <span
          className={selectedOption ? 'text-14-16' : 'text-14-16 text-gray-400 dark:text-gray-500'}
        >
          {selectedOption?.label ?? placeholder}
        </span>

        <svg
          className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 fill-gray-500 dark:fill-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          viewBox='0 0 20 20'
          aria-hidden='true'
        >
          <path
            fillRule='evenodd'
            d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z'
            clipRule='evenodd'
          />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          role='listbox'
          className='absolute z-9999 mt-1.5 w-full rounded-xl border border-border-card-children-light dark:border-border-card-children-dark bg-[#fdf6ed]/95 dark:bg-[#2a1f1c]/95 backdrop-blur-3xl shadow-xl shadow-black/15 dark:shadow-black/40 animate-scale-in origin-top'
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === currentValue;
            const isHighlighted = i === highlightedIndex;

            return (
              <li
                key={opt.value}
                role='option'
                aria-selected={isSelected}
                className={`flex items-center justify-between px-3 py-2.5 text-14-16 cursor-pointer transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl ${
                  isSelected
                    ? 'text-amber-600 dark:text-amber-400 font-medium'
                    : 'text-gray-900 dark:text-gray-100'
                } ${isHighlighted ? 'bg-amber-50/80 dark:bg-amber-900/30' : 'hover:bg-amber-50/60 dark:hover:bg-amber-900/20'}`}
                onClick={() => selectValue(opt.value)}
                onMouseEnter={() => setHighlightedIndex(i)}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <svg className='w-4 h-4 fill-amber-500 shrink-0 ml-2' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z'
                      clipRule='evenodd'
                    />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {required && !currentValue && (
        <input
          tabIndex={-1}
          aria-hidden='true'
          className='absolute inset-0 opacity-0 pointer-events-none'
          required
          value=''
          onChange={() => {}}
        />
      )}
    </div>
  );
};

Select.displayName = 'Select';
