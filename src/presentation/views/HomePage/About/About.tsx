'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import { Button, Card } from '@/components/atoms';
import ArrowLeft from '@/icons/arrowLeft.svg';
import ArrowRight from '@/icons/arrowRight.svg';
import AwardIcon from '@/icons/award.svg';
import ClockIcon from '@/icons/clock.svg';
import CoffeeIcon from '@/icons/coffe.svg';
import HeartIcon from '@/icons/heart.svg';
import UserIcon from '@/icons/user.svg';
import MyBakeryImage from '@/images/myBakery.avif';
import { useTranslation } from '@/shared/hooks';

const timelineEvents = [
  {
    year: '2003',
    title: 'Fundación',
    description: 'Abrimos nuestra primera panadería con recetas familiares tradicionales',
    icon: CoffeeIcon,
    image: MyBakeryImage,
    position: 'top'
  },

  {
    year: '2022',
    title: 'Sostenibilidad',
    description: 'Implementamos prácticas 100% sostenibles y packaging ecológico',
    icon: CoffeeIcon,
    image: MyBakeryImage,
    position: 'bottom'
  },
  {
    year: '2024',
    title: 'Presente',
    description: 'Más de 50 productos únicos y miles de clientes satisfechos',
    icon: CoffeeIcon,
    image: MyBakeryImage,
    position: 'top'
  },
  {
    year: '2008',
    title: 'Expansión',
    description: 'Agregamos café premium y productos artesanales a nuestro menú',
    icon: CoffeeIcon,
    image: MyBakeryImage,
    position: 'bottom'
  },
  {
    year: '2012',
    title: 'Reconocimiento',
    description: "Ganamos el premio 'Mejor Panadería Local' por tres años consecutivos",
    icon: CoffeeIcon,
    image: MyBakeryImage,
    position: 'top'
  },
  {
    year: '2018',
    title: 'Innovación',
    description: 'Introducimos opciones veganas y sin gluten para toda la comunidad',
    icon: CoffeeIcon,
    image: MyBakeryImage,
    position: 'bottom'
  },
  {
    year: '2020',
    title: 'Digitalización',
    description: 'Lanzamos nuestra plataforma online y servicio de delivery',
    icon: CoffeeIcon,
    image: MyBakeryImage,
    position: 'top'
  }
];

const features = [
  {
    icon: HeartIcon,
    title: 'Hecho con Amor',
    description:
      'Cada producto está elaborado con pasión y dedicación por nuestros maestros panaderos.'
  },
  {
    icon: AwardIcon,
    title: 'Hecho con Amor',
    description:
      'Cada producto está elaborado con pasión y dedicación por nuestros maestros panaderos.'
  },
  {
    icon: UserIcon,
    title: 'Hecho con Amor',
    description:
      'Cada producto está elaborado con pasión y dedicación por nuestros maestros panaderos.'
  },
  {
    icon: ClockIcon,
    title: 'Hecho con Amor',
    description:
      'Cada producto está elaborado con pasión y dedicación por nuestros maestros panaderos.'
  }
];

export function About() {
  const { t } = useTranslation();

  const [isVisible, setIsVisible] = useState(false);
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const itemsPerView = 3;
  const maxSlides = Math.max(0, Math.ceil(timelineEvents.length / itemsPerView) - 1);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);

            // Animate timeline items one by one
            timelineEvents.forEach((_, index) => {
              setTimeout(() => {
                setVisibleItems(prev => [...prev, index]);
              }, index * 300);
            });
          }
        });
      },
      { threshold: 0.2 }
    );

    const section = document.getElementById('about');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  // Navigation functions
  const nextSlide = () => {
    setCurrentSlide(prev => (prev >= maxSlides ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev <= 0 ? maxSlides : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section id='about' className='relative min-h-dvh flex items-center justify-center pt-24'>
      {/* Background decorations */}
      <div
        className='absolute top-10 left-10 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl animate-bounce'
        style={{ animationDuration: '6s' }}
      ></div>
      <div
        className='absolute bottom-10 right-10 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl animate-bounce'
        style={{ animationDelay: '3s', animationDuration: '6s' }}
      ></div>

      <div className='relative z-10 w-full'>
        {/* Header */}
        <div className='text-center flex flex-col gap-4 mb-16'>
          <h2 className='text-60-96 leading-normal font-bold text-gray-900 dark:text-gray-100 drop-shadow-lg'>
            {t('about.title')}
          </h2>
          <p className='text-2xl leading-normal text-gray-600 dark:text-gray-400 max-w-3xl mx-auto drop-shadow-sm'>
            {t('about.description')}
          </p>
        </div>

        {/* Desktop Timeline - Horizontal Slider */}
        <div className='hidden lg:flex lg:flex-col lg:gap-8 relative mb-20'>
          {/* Navigation Buttons */}
          <div
            className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-20 ${
              currentSlide === 0 ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <Button
              variant='glass'
              onClick={prevSlide}
              className='hover:scale-110 shadow-lg p-1'
              disabled={currentSlide === 0}
            >
              <ArrowLeft className='h-5 w-5' />
            </Button>
          </div>

          <div
            className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-20 ${
              currentSlide === maxSlides ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <Button
              variant='glass'
              onClick={nextSlide}
              className='hover:scale-110 shadow-lg p-1'
              disabled={currentSlide === maxSlides}
            >
              <ArrowRight className='h-5 w-5' />
            </Button>
          </div>

          {/* Timeline Line */}
          <div className='absolute w-11/12 top-1/2 left-1/2 right-1/2 -translate-x-1/2 h-1 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 rounded-full transform -translate-y-1/2 z-0'>
            <div
              className={`h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-2000 ease-out ${
                isVisible ? 'w-4/5' : 'w-0'
              }`}
            />
          </div>

          {/* Timeline Container */}
          <div className='mx-12 relative overflow-x-hidden'>
            {/* Timeline Items Slider */}
            <div
              className='flex flex-nowrap gap-16 px-6 transition-transform duration-[5000ms] ease-in-out'
              style={{
                transform: `translateX(-${(currentSlide * 100) / (maxSlides + 1)}%)`,
                width: `${(timelineEvents.length / itemsPerView) * 100}%`,
                minHeight: '600px'
              }}
            >
              {timelineEvents.map((event, index) => (
                <div
                  key={index}
                  className='flex flex-col items-center px-4'
                  style={{
                    width: `${100 / timelineEvents.length}%`,
                    transition: 'all 0.6s ease'
                  }}
                >
                  {/* Content Card */}
                  <Card
                    variant='glass-heavy'
                    className={`w-72 flex flex-col gap-4 hover:shadow-xl transition-all duration-700 ease-in-out p-6 text-center group ${
                      event.position === 'top' ? 'order-1 mb-8' : 'order-3 mt-12'
                    }`}
                  >
                    <figure className='max-w-3xs'>
                      <Image
                        src={event.image || MyBakeryImage}
                        alt='Panadería My Bakery con productos frescos'
                        className='w-full h-full rounded-xl object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1'
                        placeholder='blur'
                        priority
                      />
                    </figure>

                    <h3 className='text-xl leading-normal font-bold text-amber-600 drop-shadow-sm'>
                      {event.title}
                    </h3>
                    <p className='text-base leading-normal text-gray-600 dark:text-gray-400'>
                      {event.description}
                    </p>
                  </Card>

                  {/* Year Badge */}
                  <div className='order-2 relative'>
                    <div className='w-16 h-16 backdrop-blur-md backdrop-saturate-180 bg-amber-600/20 dark:bg-amber-600/15 border border-amber-600/30 dark:border-amber-500/20 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group'>
                      <event.icon className='h-6 w-6 text-amber-600 group-hover:rotate-12 transition-transform duration-300' />
                    </div>
                    <div className='absolute -bottom-9 left-1/2 transform -translate-x-1/2'>
                      <span className='text-2xl leading-normal font-bold text-amber-600 drop-shadow-lg whitespace-nowrap'>
                        {event.year}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slide Indicators */}
          <div className='flex justify-center gap-2'>
            {Array.from({ length: maxSlides + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-700 ease-in-out ${
                  currentSlide === index
                    ? 'bg-amber-600 scale-125'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-amber-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Mobile Timeline - Vertical (unchanged) */}
        <div className='lg:hidden relative mb-20'>
          {/* Vertical Timeline Line */}
          <div
            className={`absolute h-11/12 left-8 top-0 w-1 bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 rounded-full ${
              isVisible ? 'h-full' : 'h-0'
            }`}
          >
            {/* <div
              className={`w-full bg-gradient-to-b from-amber-500 to-orange-500 rounded-full transition-all duration-2000 ease-out ${
                isVisible ? 'h-full' : 'h-0'
              }`}
            /> */}
          </div>

          {/* Vertical Timeline Items */}
          <div className='flex flex-col gap-16'>
            {timelineEvents.map((event, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 transition-all duration-700 ${
                  visibleItems.includes(index)
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-10'
                }`}
                style={{
                  transitionDelay: `${index * 200}ms`
                }}
              >
                {/* Year Badge */}
                <div className='flex-shrink-0 relative z-10'>
                  <div className='w-16 h-16 backdrop-blur-md backdrop-saturate-180 bg-amber-600/20 dark:bg-amber-600/15 border border-amber-600/30 dark:border-amber-500/20 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group'>
                    <event.icon className='h-6 w-6 text-amber-600 group-hover:rotate-12 transition-transform duration-300' />
                  </div>
                  <Card
                    variant='glass-heavy'
                    className='absolute flex items-center justify-center -bottom-6 left-1/2 transform -translate-x-1/2'
                  >
                    <span className='text-lg font-bold text-amber-600 drop-shadow-lg whitespace-nowrap'>
                      {event.year}
                    </span>
                  </Card>
                </div>

                {/* Content Card */}
                <Card
                  variant='glass'
                  className='p-6 w-full shadow-xl group rounded-2xl hover:shadow-2xl'
                >
                  <div className='flex items-center gap-4'>
                    <div className='w-20 h-20 rounded-xl overflow-hidden backdrop-blur-md backdrop-saturate-180 bg-amber-600/20 dark:bg-amber-600/15 border border-amber-600/30 dark:border-amber-500/20 flex-shrink-0'>
                      <Image
                        src={event.image || MyBakeryImage}
                        alt='Panadería My Bakery con productos frescos'
                        className='w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1'
                        placeholder='blur'
                        priority
                      />
                    </div>
                    <div className='flex-1'>
                      <h3 className='text-lg font-bold text-amber-600 mb-2 drop-shadow-sm'>
                        {event.title}
                      </h3>
                      <p className='text-sm text-gray-600 dark:text-gray-400 leading-relaxed'>
                        {event.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {features.map((feature, index) => (
            <Card
              key={index}
              variant='glass'
              className={`p-6 text-center rounded-2xl transition-transform duration-500  hover:scale-105 group ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
            >
              <div className='w-16 h-16 backdrop-blur-md backdrop-saturate-180 bg-amber-600/20 dark:bg-amber-600/15 border border-amber-600/30 dark:border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:rotate-12'>
                <feature.icon className='h-8 w-8 text-amber-600' />
              </div>
              <h3 className='text-xl leading-normal font-semibold text-gray-900 dark:text-gray-100 mb-2 drop-shadow-sm'>
                {feature.title}
              </h3>
              <p className='text-gray-600 dark:text-gray-400 text-base leading-normal'>
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Bottom Description */}
        <div className='text-center mt-16'>
          <p className='text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed drop-shadow-sm'>
            {t('about.footer')}
          </p>
        </div>
      </div>
    </section>
  );
}
