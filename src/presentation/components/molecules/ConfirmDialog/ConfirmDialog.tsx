'use client';

import type { FC } from 'react';

import { Button, Modal } from '@/components/atoms';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  loading?: boolean;
}

const iconVariants = {
  danger: (
    <div className='mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4'>
      <svg
        className='w-6 h-6 text-red-500'
        fill='none'
        viewBox='0 0 24 24'
        strokeWidth={1.5}
        stroke='currentColor'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z'
        />
      </svg>
    </div>
  ),
  warning: (
    <div className='mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/20 mb-4'>
      <svg
        className='w-6 h-6 text-amber-500'
        fill='none'
        viewBox='0 0 24 24'
        strokeWidth={1.5}
        stroke='currentColor'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z'
        />
      </svg>
    </div>
  )
};

const confirmButtonClasses = {
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  warning: 'bg-amber-500 hover:bg-amber-600 text-white'
};

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  loading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size='sm'>
      <div className='text-center'>
        {iconVariants[variant]}
        <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>{title}</h3>
        {description && (
          <p className='text-16-20 text-gray-500 dark:text-gray-400 mb-6'>{description}</p>
        )}
        <div className='flex gap-3 justify-center'>
          <Button variant='secondary' onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <button
            type='button'
            onClick={onConfirm}
            disabled={loading}
            className={`px-6 py-2 text-14-16 rounded-lg font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${confirmButtonClasses[variant]}`}
          >
            {loading ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

ConfirmDialog.displayName = 'ConfirmDialog';
