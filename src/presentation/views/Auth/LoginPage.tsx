'use client';

import type { FC } from 'react';

import { Button, Card } from '@/components/atoms';
import { BakeryAnimate } from '@/components/molecules';
import { signInWithGoogle } from '@/lib/auth/actions';
import { useTranslation } from '@/shared/hooks/useTranslate';

const GoogleIcon = () => (
  <svg className='w-5 h-5' viewBox='0 0 24 24'>
    <title>Google</title>
    <path
      d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z'
      fill='#4285F4'
    />
    <path
      d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
      fill='#34A853'
    />
    <path
      d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
      fill='#FBBC05'
    />
    <path
      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
      fill='#EA4335'
    />
  </svg>
);

const BENEFITS = [
  { emoji: '\u{1F950}', key: 'benefit1', fallback: 'Pide en linea' },
  { emoji: '\u{1F4E6}', key: 'benefit2', fallback: 'Sigue tus pedidos' },
  { emoji: '\u2B50', key: 'benefit3', fallback: 'Deja tus resenas' }
] as const;

export const LoginPage: FC = () => {
  const { t } = useTranslation();

  const handleGoogleSignIn = async () => {
    const redirectTo = new URLSearchParams(window.location.search).get('redirectTo') || undefined;
    const url = await signInWithGoogle(redirectTo);
    window.location.href = url;
  };

  return (
    <div className='relative flex items-center justify-center min-h-[calc(100dvh-80px)] py-12 px-4 overflow-hidden'>
      <div className='w-full max-w-md animate-fade-in'>
        <Card variant='children' className='p-8 sm:p-10 rounded-2xl!'>
          {/* Welcome */}
          <div className='text-center mb-8'>
            <h1 className='text-24-36 font-bold text-gray-900 dark:text-gray-100'>
              {t('auth.welcomeTitle', 'Bienvenido a My Bakery')}
            </h1>
            <p className='text-16-20 text-gray-600 dark:text-gray-400 mt-3'>
              {t('auth.welcomeSubtitle', 'Inicia sesion para pedir tus productos favoritos')}
            </p>
          </div>

          {/* Benefits */}
          <div className='grid grid-cols-3 gap-3 mb-8'>
            {BENEFITS.map(({ emoji, key, fallback }) => (
              <Card
                key={key}
                variant='children'
                className='flex flex-col items-center gap-2 p-3 text-center'
              >
                <span className='text-2xl'>{emoji}</span>
                <span className='text-14-16 font-medium text-gray-700 dark:text-gray-300'>
                  {t(`auth.${key}`, fallback)}
                </span>
              </Card>
            ))}
          </div>

          {/* Google sign-in */}
          <form action={handleGoogleSignIn}>
            <Button
              variant='ghost'
              type='submit'
              className='w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl text-16-20 hover:scale-[1.02] active:scale-95 transition-all duration-300'
            >
              <GoogleIcon />
              <span className='text-gray-700 dark:text-gray-200 font-medium'>
                {t('auth.googleButton', 'Continuar con Google')}
              </span>
            </Button>
          </form>

          {/* Terms */}
          <p className='text-center text-14-16 text-gray-400 dark:text-gray-500 mt-6 leading-relaxed'>
            {t(
              'auth.termsNote',
              'Al iniciar sesion, aceptas nuestras condiciones de uso y politica de privacidad.'
            )}
          </p>
        </Card>
      </div>

      {/* Baker animation — hidden on mobile to avoid overflow */}
      <div className='hidden md:block absolute bottom-8 right-8 w-40 h-40 opacity-50 animate-float pointer-events-none'>
        <BakeryAnimate />
      </div>
    </div>
  );
};

LoginPage.displayName = 'LoginPage';
