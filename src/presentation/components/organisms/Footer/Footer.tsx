import { FC } from 'react';
import Link from 'next/link';

import CoffeIcon from '@/icons/coffe.svg';
import FacebookIcon from '@/icons/facebooks.svg';
import InstagramIcon from '@/icons/instagram.svg';
import TwitterIcon from '@/icons/twitter.svg';

export const Footer: FC = () => {
  return (
    <footer className='bg-white/10 w-full h-full dark:bg-gray-800/10 backdrop-blur-lg border-t border-white/20 dark:border-gray-700/20'>
      <div className='container mx-auto px-4 py-12'>
        <div className='grid md:grid-cols-4 gap-8'>
          <div className='space-y-4'>
            <Link href='/' className='flex items-center space-x-2'>
              <CoffeIcon className='w-8 h-8 text-amber-600 dark:text-amber-400' />
              <span className='text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent'>
                My Bakery
              </span>
            </Link>
            <p className='text-gray-600 dark:text-gray-300'>footer.description</p>
          </div>

          <div>
            <h3 className='text-lg font-semibold mb-4 text-gray-800 dark:text-white'>
              footer.quickLinks
            </h3>
            <div className='space-y-2'>
              {['home', 'about', 'menu', 'contact'].map(item => (
                <Link
                  key={item}
                  href={`#${item}`}
                  className='block text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-300'
                >
                  item
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className='text-lg font-semibold mb-4 text-gray-800 dark:text-white'>
              footer.contact
            </h3>
            <div className='space-y-2 text-gray-600 dark:text-gray-300'>
              <p>123 Bakery Street</p>
              <p>Coffee City, CC 12345</p>
              <p>+1 (555) 123-4567</p>
              <p>hello@mybakery.com</p>
            </div>
          </div>

          <div>
            <h3 className='text-lg font-semibold mb-4 text-gray-800 dark:text-white'>
              footer.followUs
            </h3>
            <div className='flex space-x-4'>
              {[FacebookIcon, InstagramIcon, TwitterIcon].map((Icon, index) => (
                <Link
                  key={index}
                  href='#'
                  className='p-2 bg-white/20 dark:bg-gray-800/20 rounded-full hover:bg-amber-500 hover:text-white transition-all duration-300 transform hover:scale-110'
                >
                  <Icon className='w-5 h-5' />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className='border-t border-white/20 dark:border-gray-700/20 mt-8 pt-8 text-center'>
          <p className='text-gray-600 dark:text-gray-300'>
            © {new Date().getFullYear()} My Bakery. footer.rights
          </p>
        </div>
      </div>
    </footer>
  );
};

Footer.displayName = 'Footer';
