'use client';

import Image from 'next/image';
import { type FC, useMemo, useRef, useState } from 'react';

import { IconButton } from '@/components/atoms';
import StarIcon from '@/icons/star.svg';
import TrashIcon from '@/icons/trash.svg';

interface ImageUploaderProps {
  /** Current image — either a Cloudinary URL (existing) or nothing */
  value?: string;
  /** Called with the selected File (upload deferred to form submit) */
  onFileSelect: (file: File | null) => void;
  /** Called when user clicks the trash overlay to remove the image */
  onRemove?: () => void;
  /** Whether this image is marked as the primary/main image */
  isPrimary?: boolean;
  /** Called when user clicks the star to set this as primary */
  onSetPrimary?: () => void;
  /** The pending file to preview (if any) */
  pendingFile?: File | null;
  className?: string;
}

export const ImageUploader: FC<ImageUploaderProps> = ({
  value,
  onFileSelect,
  onRemove,
  isPrimary,
  onSetPrimary,
  pendingFile,
  className = ''
}) => {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const preview = useMemo(
    () => (pendingFile ? URL.createObjectURL(pendingFile) : null),
    [pendingFile]
  );

  const displayUrl = preview || value;

  function handleFile(file: File) {
    onFileSelect(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  // When there IS an image: render only the thumbnail with hover overlay
  if (displayUrl) {
    return (
      <div className={className}>
        <div
          className={`relative group w-[150px] h-[150px] rounded-xl overflow-hidden shrink-0 cursor-pointer ${
            isPrimary ? 'ring-2 ring-amber-500' : ''
          }`}
          onClick={() => inputRef.current?.click()}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
          }}
          role='button'
          tabIndex={0}
        >
          {preview ? (
            <img src={displayUrl} alt='Preview' className='w-full h-full object-cover' />
          ) : (
            <Image
              src={displayUrl}
              alt='Uploaded'
              width={150}
              height={150}
              className='w-full h-full object-cover'
            />
          )}
          <div className='absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors' />
          {/* Primary star badge */}
          {onSetPrimary && (
            <button
              type='button'
              onClick={e => {
                e.stopPropagation();
                onSetPrimary();
              }}
              className={`absolute top-1 left-1 w-7 h-7 rounded-lg flex items-center justify-center transition-all shadow-sm ${
                isPrimary
                  ? 'bg-amber-500 text-white'
                  : '!bg-white/90 dark:!bg-gray-900/90 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-amber-500'
              }`}
              aria-label={isPrimary ? 'Imagen principal' : 'Establecer como principal'}
            >
              <StarIcon className='w-3.5 h-3.5' />
            </button>
          )}
          {onRemove && (
            <IconButton
              variant='danger'
              size='sm'
              onClick={e => {
                e.stopPropagation();
                onRemove();
              }}
              className='absolute top-1 right-1 !bg-white/90 dark:!bg-gray-900/90 !rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm'
              aria-label='Eliminar imagen'
            >
              <TrashIcon className='w-3.5 h-3.5' />
            </IconButton>
          )}
          <span className='absolute bottom-0 inset-x-0 text-center text-[11px] text-white bg-black/40 py-1 opacity-0 group-hover:opacity-100 transition-opacity'>
            Cambiar imagen
          </span>
        </div>
        <input
          ref={inputRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={handleFileChange}
        />
      </div>
    );
  }

  // When there is NO image: render only the drop zone
  return (
    <div className={className}>
      <button
        type='button'
        onDragOver={e => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`inline-flex flex-col items-center justify-center w-[150px] h-[150px] rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
          dragOver
            ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50/30 dark:hover:bg-amber-900/10'
        }`}
      >
        <svg
          className='w-6 h-6 text-gray-400 dark:text-gray-500 mb-1'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          aria-hidden='true'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z'
          />
        </svg>
        <span className='text-[11px] text-gray-500 dark:text-gray-400 text-center leading-tight'>
          {dragOver ? 'Suelta aqui' : 'Arrastra o clic'}
        </span>
        <input
          ref={inputRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={handleFileChange}
        />
      </button>
    </div>
  );
};

ImageUploader.displayName = 'ImageUploader';
