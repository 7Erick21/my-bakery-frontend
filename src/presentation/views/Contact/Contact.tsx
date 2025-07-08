'use client';

import { useEffect, useState } from 'react';

import { Button, Card } from '@/components/atoms';
import CoffeeIcon from '@/icons/coffe.svg';

export function Contact() {
  const [isVisible, setIsVisible] = useState(false);

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

    const section = document.getElementById('contacto');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section id='contact' className='min-h-dvh flex items-center justify-center'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='text-center space-y-4 mb-16 animate-fade-in'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100'>
            {'contact.title'}
          </h2>
          <p className='text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
            {'contact.description'}
          </p>
        </div>

        <div className='grid lg:grid-cols-2 gap-12'>
          {/* Contact Info */}
          <div
            className={`space-y-8 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
          >
            <div className='space-y-6'>
              <h3 className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>
                {'contact.info'}
              </h3>

              <div className='space-y-4'>
                {[
                  {
                    icon: CoffeeIcon,
                    title: 'contact.address',
                    content: 'contact.addressValue'.split('\n')
                  },
                  {
                    icon: CoffeeIcon,
                    title: 'contact.phone',
                    content: ['hero.phone']
                  },
                  {
                    icon: CoffeeIcon,
                    title: 'contact.email',
                    content: ['info@mybakery.com']
                  },
                  {
                    icon: CoffeeIcon,
                    title: 'contact.hours',
                    content: [
                      'contact.hoursWeekdays',
                      'contact.hoursSaturday',
                      'contact.hoursSunday'
                    ]
                  }
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-4 transition-all duration-500 hover:scale-105 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                    }`}
                    style={{ transitionDelay: `${index * 200}ms` }}
                  >
                    <item.icon className='h-6 w-6 text-amber-600 mt-1 transition-transform duration-300 hover:rotate-12' />
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

            {/* Map Placeholder */}
            <Card className='overflow-hidden hover:shadow-lg transition-all duration-300'>
              <Card className='p-0'>
                <div className='aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300'>
                  <div className='text-center text-gray-500 dark:text-gray-400'>
                    <CoffeeIcon className='h-12 w-12 mx-auto mb-2 animate-bounce' />
                    <p>{'contact.mapLocation'}</p>
                  </div>
                </div>
              </Card>
            </Card>
          </div>

          {/* Contact Form */}
          <Card
            className={`transition-all duration-1000 delay-300 hover:shadow-xl ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            <Card className='p-8'>
              <form className='space-y-6'>
                <div className='space-y-2'>
                  <h3 className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>
                    {'contact.sendMessage'}
                  </h3>
                  <p className='text-gray-600 dark:text-gray-400'>{'contact.responseTime'}</p>
                </div>

                <div className='grid md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <label
                      htmlFor='firstName'
                      className='text-sm font-medium text-gray-900 dark:text-gray-100'
                    >
                      {'contact.firstName'}
                    </label>
                    <input
                      id='firstName'
                      placeholder={'contact.firstName'}
                      className='transition-all duration-300 focus:scale-105'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label
                      htmlFor='lastName'
                      className='text-sm font-medium text-gray-900 dark:text-gray-100'
                    >
                      {'contact.lastName'}
                    </label>
                    <input
                      id='lastName'
                      placeholder={'contact.lastName'}
                      className='transition-all duration-300 focus:scale-105'
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <label
                    htmlFor='email'
                    className='text-sm font-medium text-gray-900 dark:text-gray-100'
                  >
                    {'contact.email'}
                  </label>
                  <input
                    id='email'
                    type='email'
                    placeholder='tu@email.com'
                    className='transition-all duration-300 focus:scale-105'
                  />
                </div>

                <div className='space-y-2'>
                  <label
                    htmlFor='phone'
                    className='text-sm font-medium text-gray-900 dark:text-gray-100'
                  >
                    {'contact.phone'}
                  </label>
                  <input
                    id='phone'
                    type='tel'
                    placeholder='(555) 123-4567'
                    className='transition-all duration-300 focus:scale-105'
                  />
                </div>

                <div className='space-y-2'>
                  <label
                    htmlFor='message'
                    className='text-sm font-medium text-gray-900 dark:text-gray-100'
                  >
                    {'contact.message'}
                  </label>
                  <textarea
                    id='message'
                    placeholder={'contact.messagePlaceholder'}
                    rows={4}
                    className='transition-all duration-300 focus:scale-105'
                  />
                </div>

                <Button className='w-full transition-all duration-300 hover:scale-105 hover:shadow-lg'>
                  {'contact.send'}
                </Button>
              </form>
            </Card>
          </Card>
        </div>
      </div>
    </section>
  );
}
