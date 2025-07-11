import React, { FC } from 'react';
import Image from 'next/image';

import { Card } from '@/components/atoms';
import CoffeeIcon from '@/icons/coffe.svg';
import PlaceholderImage from '@/images/placeholder.webp';

export const Home: FC = () => {
  return (
    <div id='home' className='flex justify-center items-center min-h-dvh py-24'>
      <div className='relative z-10'>
        <div className='grid lg:grid-cols-2 gap-12 items-center'>
          {/* Content */}
          <div className={`flex flex-col gap-8 transition-all duration-1000 animate-slide-in`}>
            <div className='flex flex-col gap-4'>
              <h1 className='text-34-56 font-bold text-gray-900 dark:text-gray-100 leading-tight drop-shadow-lg'>
                Horneado fresco <br />
                <span className='text-amber-600 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text animate-pulse drop-shadow-lg'>
                  todos los días
                </span>
              </h1>
              <p className='text-xl text-gray-600 dark:text-gray-400 leading-relaxed drop-shadow-sm'>
                Descubre el sabor auténtico de nuestros panes artesanales, pasteles caseros y café
                recién molido. Cada producto está hecho con amor y los mejores ingredientes.
              </p>
            </div>

            {/* Quick Info */}
            <div className='flex flex-col sm:flex-row gap-4'>
              {[
                { icon: CoffeeIcon, text: 'hero.openHours' },
                { icon: CoffeeIcon, text: 'hero.location' },
                { icon: CoffeeIcon, text: 'hero.phone' }
              ].map((item, index) => (
                <Card
                  variant='children'
                  key={index}
                  className={`flex items-center gap-2 text-gray-600 dark:text-gray-400 transition-transform duration-500 hover:text-amber-600 hover:scale-105 glass-light rounded-lg p-3 animate-slide-in`}
                  style={{ animationDelay: `${(index + 1) * 200}ms` }}
                >
                  <item.icon className='!h-5 !w-5 text-amber-600 drop-shadow-sm' />
                  <span className='text-sm font-medium drop-shadow-sm'>{item.text}</span>
                </Card>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className='relative transition-transform duration-500 animate-slide-in shadow-2xl hover:shadow-3xl hover:scale-105'>
            <Card variant='glass' className='relative p-3 !rounded-lg overflow-hidden'>
              <div className=''>
                <Image
                  src={PlaceholderImage}
                  alt='Panadería My Bakery con productos frescos'
                  className='w-full h-full object-contain'
                  placeholder='blur'
                  priority
                />
              </div>
            </Card>

            {/* Floating Card */}
            <Card className='absolute -bottom-6 -left-6 glass-amber rounded-2xl shadow-2xl p-16-24 max-w-xs transition-transform duration-500 hover:scale-105 hover:shadow-3xl animate-glass-float'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 glass-light rounded-full flex items-center justify-center'>
                  <CoffeeIcon className='h-6 w-6 text-amber-600 animate-bounce drop-shadow-sm' />
                </div>
                <div>
                  <p className='font-semibold text-gray-900 dark:text-gray-100 drop-shadow-sm'>
                    Más de 50
                  </p>
                  <p className='text-sm text-gray-600 dark:text-gray-400 drop-shadow-sm'>
                    Productos frescos diarios
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

Home.displayName = 'Home';
