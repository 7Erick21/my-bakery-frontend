'use client';

import { type FC, useCallback, useMemo, useRef, useState } from 'react';

import { Button, Card, IconButton, Textarea } from '@/components/atoms';
import TrashIcon from '@/icons/trash.svg';
import { getErrorMessage } from '@/lib/utils/error';
import { createReview } from '@/server/actions/reviews';
import { useTranslation } from '@/shared/hooks/useTranslate';

import { StarRating } from './StarRating';

interface ReviewFormProps {
  productId?: string;
  onSuccess?: () => void;
  embedded?: boolean;
}

export const ReviewForm: FC<ReviewFormProps> = ({ productId, onSuccess, embedded }) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previews = useMemo(() => imageFiles.map(f => URL.createObjectURL(f)), [imageFiles]);

  const addFiles = useCallback((files: FileList | File[]) => {
    setImageFiles(prev => {
      const remaining = 4 - prev.length;
      const validFiles = Array.from(files)
        .filter(f => f.type.startsWith('image/'))
        .slice(0, remaining);
      return validFiles.length > 0 ? [...prev, ...validFiles] : prev;
    });
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    addFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  function removeImage(index: number) {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  }

  async function uploadImages(files: File[]): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.set('file', file);
      formData.set('folder', 'my-bakery/reviews');

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      urls.push(data.url);
    }
    return urls;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError(t('reviews.ratingRequired'));
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        imageUrls = await uploadImages(imageFiles);
      }

      const formData = new FormData();
      formData.set('rating', String(rating));
      formData.set('comment', comment);
      if (productId) formData.set('product_id', productId);
      for (const url of imageUrls) {
        formData.append('image_urls', url);
      }

      await createReview(formData);
      setSuccess(true);
      setRating(0);
      setComment('');
      setImageFiles([]);
      onSuccess?.();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    const successContent = (
      <p className='text-green-700 dark:text-green-400 font-medium text-center py-2'>
        {t('reviews.thankYou')}
      </p>
    );
    return embedded ? (
      successContent
    ) : (
      <Card variant='children' className='rounded-2xl p-6'>
        {successContent}
      </Card>
    );
  }

  const formContent = (
    <form onSubmit={handleSubmit} className='space-y-5'>
      {!embedded && (
        <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
          {t('reviews.writeReview')}
        </h3>
      )}

      <div>
        <span className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
          {t('reviews.rating')} <span className='text-red-500'>*</span>
        </span>
        <StarRating rating={rating} onChange={setRating} />
      </div>

      <div>
        <label
          htmlFor='review-comment'
          className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
        >
          {t('reviews.comment')} <span className='text-red-500'>*</span>
        </label>
        <Textarea
          id='review-comment'
          value={comment}
          onChange={e => setComment(e.target.value)}
          required
          rows={4}
          placeholder={t('reviews.placeholder')}
        />
      </div>

      {/* Image upload area */}
      <div>
        <span className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
          {t('reviews.addImages')}
        </span>

        <div className='flex gap-3 flex-wrap items-start'>
          {/* Previews */}
          {previews.map((url, i) => (
            <div
              key={imageFiles[i].name + i}
              className='relative group w-[150px] h-[150px] rounded-xl overflow-hidden'
            >
              <img src={url} alt='' className='w-full h-full object-cover' />
              <div className='absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors' />
              <IconButton
                variant='danger'
                size='sm'
                onClick={() => removeImage(i)}
                className='absolute top-1 right-1 !bg-white/90 dark:!bg-gray-900/90 !rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm'
                aria-label={t('reviews.removeImage')}
              >
                <TrashIcon className='w-3.5 h-3.5' />
              </IconButton>
            </div>
          ))}

          {/* Drop zone */}
          {imageFiles.length < 4 && (
            <button
              type='button'
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`inline-flex flex-col items-center justify-center w-[150px] h-[150px] rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                isDragging
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
                {isDragging
                  ? t('reviews.dropHere', 'Suelta aqui')
                  : t('reviews.dragOrClick', 'Arrastra o clic')}
              </span>
              <span className='text-[10px] text-gray-400 dark:text-gray-500'>
                {imageFiles.length}/4
              </span>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                multiple
                onChange={handleFileSelect}
                className='hidden'
              />
            </button>
          )}
        </div>
      </div>

      {error && <p className='text-red-500 text-sm'>{error}</p>}

      <Button variant='primary' type='submit' disabled={submitting}>
        {submitting ? t('reviews.submitting') : t('reviews.submit')}
      </Button>
    </form>
  );

  return embedded ? (
    formContent
  ) : (
    <Card variant='children' className='rounded-2xl p-6'>
      {formContent}
    </Card>
  );
};

ReviewForm.displayName = 'ReviewForm';
