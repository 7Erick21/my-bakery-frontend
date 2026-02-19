'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button, Card } from '@/components/atoms';
import ClockIcon from '@/icons/clock.svg';
import LocationIcon from '@/icons/location.svg';
import MailIcon from '@/icons/mail.svg';
import PhoneIcon from '@/icons/phone.svg';
import type { LandingBusinessInfoItem, LandingCmsSection } from '@/lib/supabase/models';
import { getBusinessValue, getTranslation } from '@/lib/utils/translation';
import { useTranslation } from '@/shared/hooks';

interface ContactProps {
  introContent?: LandingCmsSection;
  businessInfo?: LandingBusinessInfoItem[];
}

export function Contact({ introContent, businessInfo = [] }: ContactProps) {
  const { lang, t } = useTranslation();

  const intro = getTranslation(introContent?.cms_content_translations, lang);

  const sectionTitle = intro?.title || t('contact.title');
  const sectionDescription = intro?.body || t('contact.description');
  const contactSubtitle = intro?.subtitle || t('contact.contact');

  const address = getBusinessValue(businessInfo, 'address', lang) || t('contact.address.value');
  const city = getBusinessValue(businessInfo, 'city', lang);
  const phone = getBusinessValue(businessInfo, 'phone', lang) || t('contact.phone.value');
  const email = getBusinessValue(businessInfo, 'email', lang) || t('contact.email.value');
  const weekdays =
    getBusinessValue(businessInfo, 'hours_weekdays', lang) || t('contact.hours.valueWeekdays');
  const saturday =
    getBusinessValue(businessInfo, 'hours_saturday', lang) || t('contact.hours.valueSaturday');
  const sunday =
    getBusinessValue(businessInfo, 'hours_sunday', lang) || t('contact.hours.valueSunday');

  const [isVisible, setIsVisible] = useState(false);

  const addressLines = city ? [address, city] : [address];

  const contactInfo = [
    {
      icon: LocationIcon,
      title: t('contact.address.label'),
      content: addressLines
    },
    {
      icon: PhoneIcon,
      title: t('contact.phone.label'),
      content: [phone]
    },
    {
      icon: MailIcon,
      title: t('contact.email.label'),
      content: [email]
    },
    {
      icon: ClockIcon,
      title: t('contact.hours.label'),
      content: [weekdays, saturday, sunday]
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('contact');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section id='contact' className='min-h-dvh w-full py-24'>
      <div className='flex flex-col gap-16 w-full'>
        {/* Header */}
        <div className='text-center flex flex-col gap-4 animate-fade-in'>
          <h2 className='text-60-96 leading-normal font-bold text-gray-900 dark:text-gray-100'>
            {sectionTitle}
          </h2>
          <p className='text-2xl leading-normal text-gray-600 dark:text-gray-400'>
            {sectionDescription}
          </p>
          {intro?.cta_text && intro?.cta_url && (
            <Link href={intro.cta_url as Route} className='mx-auto'>
              <Button variant='primary' className='cursor-pointer'>
                {intro.cta_text}
              </Button>
            </Link>
          )}
        </div>

        <div className='grid items-center lg:grid-cols-2 gap-12 w-full'>
          {/* Contact Info */}
          <div
            className={`flex flex-col gap-8 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
          >
            <div className='flex flex-col gap-6'>
              <h3 className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>
                {contactSubtitle}
              </h3>

              <div className='flex flex-col gap-6'>
                {contactInfo.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-4 transition-all duration-300 ease-in-out origin-left hover:scale-110 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                    }`}
                    style={{ transitionDelay: `${index * 200}ms` }}
                  >
                    <item.icon className='h-6 w-6 text-amber-600 transition-transform duration-500 ease-in-out hover:rotate-12' />
                    <div>
                      <h4 className='font-semibold text-gray-900 dark:text-gray-100'>
                        {item.title}
                      </h4>
                      <div className='text-gray-600 dark:text-gray-400'>
                        {item.content.map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <Card
            variant='glass-light'
            className='transition-transform duration-700 ease-in-out p-3 rounded-4xl w-full h-full min-h-[500px] shadow-gray-700/20 shadow-xl dark:shadow-gray-200/20 hover:scale-105 hover:shadow-xl'
          >
            <figure className='rounded-3xl w-full h-full overflow-hidden border border-solid border-gray-700 dark:border-gray-200'>
              <iframe
                title='Google Maps - My Bakery'
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5982.196965017033!2d2.1744669!3d41.4370847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a4bd3ccab05b89%3A0xebb6cb539a58e5e5!2sMy%20Bakery!5e0!3m2!1s${lang}!2ses!4v1752364589737!5m2!1s${lang}!2ses`}
                width='400'
                height='300'
                className='w-full h-full'
                loading='lazy'
              />
            </figure>
          </Card>
        </div>
      </div>
    </section>
  );
}
