'use client';

import Image from 'next/image';
import { type FC, useMemo, useRef, useState } from 'react';

interface ImageUploaderProps {
  /** Current image — either a Cloudinary URL (existing) or nothing */
  value?: string;
  /** Called with the selected File (upload deferred to form submit) */
  onFileSelect: (file: File | null) => void;
  /** The pending file to preview (if any) */
  pendingFile?: File | null;
  className?: string;
}

export const ImageUploader: FC<ImageUploaderProps> = ({
  value,
  onFileSelect,
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

  return (
    <div className={className}>
      <div
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
            : 'border-border-card-children-light dark:border-border-card-children-dark hover:border-amber-400'
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {displayUrl ? (
          <div className='relative'>
            {preview ? (
              <img
                src={displayUrl}
                alt='Preview'
                className='mx-auto rounded-lg object-cover max-h-48'
              />
            ) : (
              <Image
                src={displayUrl}
                alt='Uploaded'
                width={200}
                height={200}
                className='mx-auto rounded-lg object-cover max-h-48'
              />
            )}
            <p className='text-14-16 text-gray-500 mt-2'>Click para cambiar</p>
          </div>
        ) : (
          <div className='py-8'>
            <p className='text-gray-500 dark:text-gray-400'>
              Arrastra una imagen o haz click para subir
            </p>
          </div>
        )}
        <input
          ref={inputRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

ImageUploader.displayName = 'ImageUploader';
