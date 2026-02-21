'use client';

import type { FC } from 'react';

import { useToastStore } from '@/shared/stores/toastStore';

const icons = {
  success: (
    <svg
      className='w-5 h-5 text-green-500'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={2}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
      />
    </svg>
  ),
  error: (
    <svg
      className='w-5 h-5 text-red-500'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={2}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z'
      />
    </svg>
  ),
  info: (
    <svg
      className='w-5 h-5 text-blue-500'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={2}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z'
      />
    </svg>
  )
};

const bgClasses = {
  success: 'border-green-200 dark:border-green-800',
  error: 'border-red-200 dark:border-red-800',
  info: 'border-blue-200 dark:border-blue-800'
};

export const ToastProvider: FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className='fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm'>
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900 border ${bgClasses[toast.type]} rounded-xl shadow-lg animate-slide-in-right`}
        >
          {icons[toast.type]}
          <p className='flex-1 text-14-16 text-gray-800 dark:text-gray-200'>{toast.message}</p>
          <button
            type='button'
            onClick={() => removeToast(toast.id)}
            className='inline-flex items-center justify-center w-6 h-6 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer'
            aria-label='Cerrar'
          >
            <svg
              className='w-3.5 h-3.5'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={2}
              stroke='currentColor'
            >
              <path strokeLinecap='round' strokeLinejoin='round' d='M6 18 18 6M6 6l12 12' />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

ToastProvider.displayName = 'ToastProvider';
