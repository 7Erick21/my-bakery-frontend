'use client';

import type { FC } from 'react';

import { Button } from '@/components/atoms';

interface FormActionsProps {
  submitting: boolean;
  submitLabel?: string;
  submittingLabel?: string;
  onCancel: () => void;
  cancelLabel?: string;
}

export const FormActions: FC<FormActionsProps> = ({
  submitting,
  submitLabel = 'Guardar cambios',
  submittingLabel = 'Guardando...',
  onCancel,
  cancelLabel = 'Cancelar'
}) => {
  return (
    <div className='flex gap-4'>
      <Button type='submit' variant='primary' disabled={submitting}>
        {submitting ? submittingLabel : submitLabel}
      </Button>
      <Button type='button' variant='secondary' onClick={onCancel}>
        {cancelLabel}
      </Button>
    </div>
  );
};

FormActions.displayName = 'FormActions';
