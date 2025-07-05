import React, { FC } from 'react';

import { Button, Card } from '@/components/atoms';
import CoffeeIcon from '@/icons/coffe.svg';
import PlaceholderImage from '@/images/placeholder.webp';

export const Home: FC = () => {
  return (
    <div>
      {/* Background with glass effect */}
      <div className='absolute inset-0 bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-pink-50/80 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-pink-950/30'></div>
      {/* Floating background elements */}
      <div className='absolute top-20 left-10 w-72 h-72 bg-amber-300/20 rounded-full blur-3xl animate-glass-float'></div>
      <div
        className='absolute bottom-20 right-10 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl animate-glass-float'
        style={{ animationDelay: '2s' }}
      ></div>

      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10'>
        <div className='grid lg:grid-cols-2 gap-12 items-center'>
          {/* Content */}
          <div className={`space-y-8 transition-all duration-1000 animate-slide-in`}>
            <div className='space-y-4'>
              <h1 className='text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight drop-shadow-lg'>
                El aroma a café y bollos recién horneados
                <span className='text-amber-600 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent animate-pulse drop-shadow-lg'>
                  te da los buenos días.
                </span>
              </h1>
              <p className='text-xl text-gray-600 dark:text-gray-400 leading-relaxed drop-shadow-sm'>
                Descubre el sabor auténtico de nuestros panes artesanales, pasteles caseros y café
                recién molido. Cada producto está hecho con amor y los mejores ingredientes.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className='flex flex-col sm:flex-row gap-4'>
              <Button className='group shadow-xl p-3'>
                Ver Menú
                {/* <ArrowRight className='ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' /> */}
              </Button>
            </div>

            {/* Quick Info */}
            <div className='grid sm:grid-cols-3 gap-4 pt-8'>
              {[
                { icon: CoffeeIcon, text: 'hero.openHours' },
                { icon: CoffeeIcon, text: 'hero.location' },
                { icon: CoffeeIcon, text: 'hero.phone' }
              ].map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 text-gray-600 dark:text-gray-400 transition-all duration-500 hover:text-amber-600 hover:scale-105 glass-light rounded-lg p-3 animate-slide-in`}
                  style={{ animationDelay: `${(index + 1) * 200}ms` }}
                >
                  <item.icon className='h-5 w-5 text-amber-600 drop-shadow-sm' />
                  <span className='text-sm font-medium drop-shadow-sm'>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <Card
            variant='children'
            className='relative transition-all duration-1000 delay-300 animate-slide-in p-3'
          >
            <div className='rounded-lg overflow-hidden glass shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105'>
              <img
                src={PlaceholderImage.src}
                alt='Panadería My Bakery con productos frescos'
                className='w-full h-full object-contain transition-transform duration-700 hover:scale-110'
              />
            </div>

            {/* Floating Card */}
            <Card className='absolute -bottom-6 -left-6 glass-amber rounded-2xl shadow-2xl p-6 max-w-xs transition-all duration-500 hover:scale-105 hover:shadow-3xl animate-glass-float'>
              <div className='flex items-center space-x-3'>
                <div className='w-12 h-12 glass-light rounded-full flex items-center justify-center'>
                  <CoffeeIcon className='h-6 w-6 text-amber-600 animate-bounce drop-shadow-sm' />
                </div>
                <div>
                  <p className='font-semibold text-gray-900 dark:text-gray-100 drop-shadow-sm'>
                    hero.statsProducts
                  </p>
                  <p className='text-sm text-gray-600 dark:text-gray-400 drop-shadow-sm'>
                    hero.statsDescription
                  </p>
                </div>
              </div>
            </Card>
          </Card>
        </div>
      </div>
    </div>
  );
};

Home.displayName = 'Home';
