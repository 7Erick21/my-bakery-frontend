import Image from 'next/image';
import Link from 'next/link';
import type { FC } from 'react';

import { Card } from '@/components/atoms';
import FacebookIcon from '@/icons/facebooks.svg';
import InstagramIcon from '@/icons/instagram.svg';
import LinkedinIcon from '@/icons/linkedin.svg';
import PinterestIcon from '@/icons/pinterest.svg';
import TelegramIcon from '@/icons/telegram.svg';
import ThreadsIcon from '@/icons/threads.svg';
import TiktokIcon from '@/icons/tiktok.svg';
import TwitterIcon from '@/icons/twitter.svg';
import WhatsappIcon from '@/icons/whatsapp.svg';
import YoutubeIcon from '@/icons/youtube.svg';
import LogoImage from '@/images/logo.avif';
import type {
  LandingBusinessInfoItem,
  LandingCmsSection,
  LandingSocialLink
} from '@/lib/supabase/models';
import { getBusinessValue, getTranslation } from '@/lib/utils/translation';
import { useTranslation } from '@/presentation/shared/hooks/useTranslate';
import { menusItems } from '@/shared/defaults';

const socialIconMap: Record<string, typeof FacebookIcon> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  twitter: TwitterIcon,
  tiktok: TiktokIcon,
  youtube: YoutubeIcon,
  whatsapp: WhatsappIcon,
  linkedin: LinkedinIcon,
  pinterest: PinterestIcon,
  telegram: TelegramIcon,
  threads: ThreadsIcon
};

interface FooterProps {
  footerContent?: LandingCmsSection;
  businessInfo?: LandingBusinessInfoItem[];
  socialLinks?: LandingSocialLink[];
}

export const Footer: FC<FooterProps> = ({ footerContent, businessInfo = [], socialLinks }) => {
  const { lang, t } = useTranslation();

  const footerCms = getTranslation(footerContent?.cms_content_translations, lang);
  const description = footerCms?.body || t('footer.description');

  const address = getBusinessValue(businessInfo, 'address', lang) || t('footer.address');
  const city = getBusinessValue(businessInfo, 'city', lang) || t('footer.city');
  const phone = getBusinessValue(businessInfo, 'phone', lang) || t('footer.phone');
  const email = getBusinessValue(businessInfo, 'email', lang) || t('footer.email');

  const resolvedSocialLinks = socialLinks?.length
    ? socialLinks.map(link => ({
        icon: socialIconMap[link.platform] || FacebookIcon,
        href: link.url,
        ariaLabel: t(`footer.social.${link.platform}`)
      }))
    : [
        { icon: FacebookIcon, href: '#', ariaLabel: t('footer.social.facebook') },
        { icon: InstagramIcon, href: '#', ariaLabel: t('footer.social.instagram') },
        { icon: TwitterIcon, href: '#', ariaLabel: t('footer.social.twitter') }
      ];

  const currentYear = new Date().getFullYear();

  return (
    <Card variant='children' className='w-full !rounded-b-none z-10'>
      <div className='flex flex-col gap-8 max-w-8xl mx-auto px-6 py-12'>
        <div className='grid md:grid-cols-4 gap-8'>
          {/* Logo */}
          <div className='flex flex-col gap-6'>
            <Link href='/' className='flex cursor-pointer items-center gap-2 group'>
              <Image
                src={LogoImage}
                alt='Logo de la panadería'
                width={32}
                height={32}
                className='w-16 h-16 rounded-full text-amber-600 dark:text-amber-400 transition-transform duration-300 group-hover:rotate-12 md:w-16-24 md:h-16-24'
              />
              <span className='text-5xl leading-tight font-bold bg-gradient-to-r from-gray-900 to-gray-900 dark:from-gray-200 dark:to-gray-200 bg-clip-text text-transparent md:text-16-24 md:leading-9'>
                {t('header.logo')}
              </span>
            </Link>
            <p className='text-gray-600 text-lg dark:text-gray-400'>{description}</p>
          </div>

          {/* Quick links */}
          <div className='flex flex-col gap-4'>
            <h3 className='text-2xl leading-tight font-semibold text-gray-900 dark:text-gray-100 tracking-wider uppercase'>
              {t('footer.quickLinks')}
            </h3>
            <div className='flex flex-col gap-3'>
              {menusItems.map(item => (
                <Link
                  key={item.key}
                  href={{ hash: item.href }}
                  className='block text-lg leading-tight text-gray-600 transition-transform duration-300 origin-left dark:text-gray-400 hover:scale-110 hover:text-amber-600 dark:hover:text-amber-400'
                  aria-label={t(`${item.ariaLabel}`)}
                >
                  {t(`footer.nav.${item.key}`)}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className='flex flex-col gap-4'>
            <h3 className='text-2xl leading-tight font-semibold text-gray-900 dark:text-gray-100 tracking-wider uppercase'>
              {t('footer.contact')}
            </h3>
            <div className='flex flex-col gap-3 text-gray-600 dark:text-gray-400 text-lg leading-tight'>
              <p>{address}</p>
              <p>{city}</p>
              <p>{phone}</p>
              <p>{email}</p>
            </div>
          </div>

          {/* Follow us */}
          <div className='flex flex-col gap-4'>
            <h3 className='text-2xl leading-tight uppercase font-semibold text-gray-900 dark:text-gray-100 tracking-wider'>
              {t('footer.followUs')}
            </h3>
            <div className='flex space-x-4'>
              {resolvedSocialLinks.map(link => (
                <Link
                  key={link.ariaLabel}
                  href={{ pathname: link.href }}
                  className='p-2 bg-gray-400/10 dark:bg-gray-200/20 rounded-full transition-all duration-300 shadow-lg shadow-gray-700/20 dark:shadow-gray-200/20 hover:shadow-xl hover:scale-110'
                  aria-label={link.ariaLabel}
                >
                  <link.icon className='w-6 h-6 stroke-gray-700 dark:stroke-gray-200' />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className='border-t border-gray-700/20 dark:border-gray-200/20 pt-8 text-center'>
          <p className='text-gray-900 dark:text-gray-100 text-lg leading-tight'>
            © {currentYear} {t('footer.copyright')}
          </p>
        </div>
      </div>
    </Card>
  );
};

Footer.displayName = 'Footer';
