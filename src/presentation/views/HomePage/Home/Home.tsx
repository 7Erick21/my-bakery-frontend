'use client';

import type { Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import type { FC } from 'react';

import { Button, Card } from '@/components/atoms';
import CloclIcon from '@/icons/clock.svg';
import CoffeeIcon from '@/icons/coffe.svg';
import LocationIcon from '@/icons/location.svg';
import PhoneIcon from '@/icons/phone.svg';
import MyBakery from '@/images/myBakery.avif';
import type { LandingBusinessInfoItem, LandingCmsSection } from '@/lib/supabase/models';
import { getBusinessValue, getTranslation } from '@/lib/utils/translation';
import { useTranslation } from '@/shared/hooks';

interface HomeProps {
  heroContent?: LandingCmsSection;
  businessInfo?: LandingBusinessInfoItem[];
}

export const Home: FC<HomeProps> = ({ heroContent, businessInfo = [] }) => {
  const { lang, t } = useTranslation();

  const hero = getTranslation(heroContent?.cms_content_translations, lang);

  const title = hero?.title || t('home.title');
  const subtitle = hero?.subtitle || t('home.subtitle');
  const description = hero?.body || t('home.description');

  const openHours = getBusinessValue(businessInfo, 'open_hours', lang) || t('home.openHours');
  const location = getBusinessValue(businessInfo, 'address', lang) || t('home.location');
  const phone = getBusinessValue(businessInfo, 'phone', lang) || t('home.phone');
  const productsCount =
    getBusinessValue(businessInfo, 'products_count', lang) || t('home.products');
  const productsTagline =
    getBusinessValue(businessInfo, 'products_tagline', lang) || t('home.productsDescription');

  const quickInfo = [
    { icon: CloclIcon, text: openHours },
    { icon: LocationIcon, text: location },
    { icon: PhoneIcon, text: phone }
  ];

  return (
    <div id='home' className='flex justify-center items-center min-h-dvh w-full py-24'>
      <div className='relative flex flex-col gap-12 z-10 w-full'>
        {/* Home Page */}
        <div className='flex flex-col justify-center gap-12 items-center lg:grid lg:grid-cols-2'>
          {/* Content */}
          <div className={`flex flex-col gap-8 transition-all duration-1000 animate-slide-in`}>
            <div className='flex flex-col gap-4'>
              <h1 className='text-72-128 font-bold leading-tight text-gray-900 dark:text-gray-100 drop-shadow-lg'>
                {title} <br />
                <span className='text-amber-600 animate-pulse drop-shadow-lg'>{subtitle}</span>
              </h1>
              <p className='text-2xl text-gray-600 dark:text-gray-400 leading-relaxed drop-shadow-sm'>
                {description}
              </p>
            </div>

            {/* CTA Button */}
            {hero?.cta_text && hero?.cta_url && (
              <Link href={hero.cta_url as Route}>
                <Button variant='primary' className='cursor-pointer w-fit'>
                  {hero.cta_text}
                </Button>
              </Link>
            )}
          </div>

          {/* Image */}
          <div className='relative transition-all duration-500 rounded-4xl w-11/12 animate-slide-in shadow-lg hover:shadow-2xl hover:scale-105 lg:w-full'>
            <Card
              variant='glass-heavy'
              className='relative p-3 !rounded-4xl !shadow-none overflow-hidden'
            >
              <div className=''>
                {heroContent?.image_url ? (
                  <Image
                    src={heroContent.image_url}
                    alt='Panadería My Bakery con productos frescos'
                    width={800}
                    height={600}
                    className='w-full h-full object-contain rounded-3xl'
                    priority
                  />
                ) : (
                  <Image
                    src={MyBakery}
                    alt='Panadería My Bakery con productos frescos'
                    className='w-full h-full object-contain rounded-3xl'
                    placeholder='blur'
                    priority
                  />
                )}
              </div>
            </Card>

            {/* Floating Card */}
            <Card className='absolute -bottom-6 -left-6 glass-amber rounded-2xl shadow-2xl py-3 px-4 max-w-xs transition-transform duration-500 hover:scale-105 hover:shadow-3xl animate-glass-float'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 glass-light rounded-full flex items-center justify-center'>
                  <CoffeeIcon className='h-6 w-6 text-amber-600 animate-bounce drop-shadow-sm' />
                </div>
                <div>
                  <p className='font-semibold text-gray-900 dark:text-gray-100 drop-shadow-sm'>
                    {productsCount}
                  </p>
                  <p className='text-sm text-gray-600 dark:text-gray-400 drop-shadow-sm'>
                    {productsTagline}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Info */}
        <div className='flex flex-col sm:flex-row gap-4'>
          {quickInfo.map((item, index) => (
            <Card
              variant='children'
              key={index}
              className={`flex items-center gap-2 text-gray-600 dark:text-gray-400 transition-all duration-500 hover:text-amber-600 hover:scale-105 glass-light rounded-lg p-3 animate-slide-in`}
              style={{ animationDelay: `${(index + 1) * 200}ms` }}
            >
              <item.icon className='w-5 h-5 text-amber-600 drop-shadow-sm' />
              <span className='text-base leading-tight font-medium drop-shadow-sm'>
                {item.text}
              </span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

Home.displayName = 'Home';
