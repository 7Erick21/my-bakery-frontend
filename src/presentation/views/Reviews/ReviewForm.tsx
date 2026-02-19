'use client';

import { type FC, useMemo, useRef, useState } from 'react';

import { getErrorMessage } from '@/lib/utils/error';
import { createReview } from '@/server/actions/reviews';
import { useTranslation } from '@/shared/hooks/useTranslate';

import { StarRating } from './StarRating';

interface ReviewFormProps {
  productId?: string;
  onSuccess?: () => void;
}

export const ReviewForm: FC<ReviewFormProps> = ({ productId, onSuccess }) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previews = useMemo(() => imageFiles.map(f => URL.createObjectURL(f)), [imageFiles]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = 4 - imageFiles.length;
    const newFiles = Array.from(files).slice(0, remaining);
    if (newFiles.length > 0) {
      setImageFiles(prev => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

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
    return (
      <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center'>
        <p className='text-green-700 dark:text-green-400 font-medium'>{t('reviews.thankYou')}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4'
    >
      <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
        {t('reviews.writeReview')}
      </h3>

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
        <textarea
          id='review-comment'
          value={comment}
          onChange={e => setComment(e.target.value)}
          required
          rows={4}
          className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
          placeholder={t('reviews.placeholder')}
        />
      </div>

      {/* Image selection (local previews, upload on submit) */}
      <div>
        <span className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
          {t('reviews.addImages')}
        </span>
        {previews.length > 0 && (
          <div className='flex gap-2 mb-3 flex-wrap'>
            {previews.map((url, i) => (
              <div key={imageFiles[i].name + i} className='relative group'>
                <img src={url} alt='' className='w-20 h-20 rounded-lg object-cover' />
                <button
                  type='button'
                  onClick={() => removeImage(i)}
                  className='absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'
                  aria-label={t('reviews.removeImage')}
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
        {imageFiles.length < 4 && (
          <label className='inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300'>
            {t('reviews.addImages')}
            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              multiple
              onChange={handleFileSelect}
              className='hidden'
            />
          </label>
        )}
      </div>

      {error && <p className='text-red-500 text-sm'>{error}</p>}

      <button
        type='submit'
        disabled={submitting}
        className='px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors cursor-pointer'
      >
        {submitting ? t('reviews.submitting') : t('reviews.submit')}
      </button>
    </form>
  );
};

ReviewForm.displayName = 'ReviewForm';
