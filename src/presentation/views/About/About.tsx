'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import { Button, Card } from '@/components/atoms';
import CoffeeIcon from '@/icons/coffe.svg';
import PlaceholderImage from '@/images/placeholder.webp';

const timelineEvents = [
  {
    year: '2003',
    title: 'Fundación',
    description: 'Abrimos nuestra primera panadería con recetas familiares tradicionales',
    icon: CoffeeIcon,
    image: PlaceholderImage,
    position: 'top'
  },
  {
    year: '2008',
    title: 'Expansión',
    description: 'Agregamos café premium y productos artesanales a nuestro menú',
    icon: CoffeeIcon,
    image: PlaceholderImage,
    position: 'bottom'
  },
  {
    year: '2012',
    title: 'Reconocimiento',
    description: "Ganamos el premio 'Mejor Panadería Local' por tres años consecutivos",
    icon: CoffeeIcon,
    image: PlaceholderImage,
    position: 'top'
  },
  {
    year: '2018',
    title: 'Innovación',
    description: 'Introducimos opciones veganas y sin gluten para toda la comunidad',
    icon: CoffeeIcon,
    image: PlaceholderImage,
    position: 'bottom'
  },
  {
    year: '2020',
    title: 'Digitalización',
    description: 'Lanzamos nuestra plataforma online y servicio de delivery',
    icon: CoffeeIcon,
    image: PlaceholderImage,
    position: 'top'
  },
  {
    year: '2022',
    title: 'Sostenibilidad',
    description: 'Implementamos prácticas 100% sostenibles y packaging ecológico',
    icon: CoffeeIcon,
    image: PlaceholderImage,
    position: 'bottom'
  },
  {
    year: '2024',
    title: 'Presente',
    description: 'Más de 50 productos únicos y miles de clientes satisfechos',
    icon: CoffeeIcon,
    image: PlaceholderImage,
    position: 'top'
  }
];

const features = [
  {
    icon: CoffeeIcon,
    title: 'Hecho con Amor',
    description:
      'Cada producto está elaborado con pasión y dedicación por nuestros maestros panaderos.'
  },
  {
    icon: CoffeeIcon,
    title: 'Hecho con Amor',
    description:
      'Cada producto está elaborado con pasión y dedicación por nuestros maestros panaderos.'
  },
  {
    icon: CoffeeIcon,
    title: 'Hecho con Amor',
    description:
      'Cada producto está elaborado con pasión y dedicación por nuestros maestros panaderos.'
  },
  {
    icon: CoffeeIcon,
    title: 'Hecho con Amor',
    description:
      'Cada producto está elaborado con pasión y dedicación por nuestros maestros panaderos.'
  }
];

export function About() {
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

    const section = document.getElementById('nosotros');
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
    <section id='about' className='relative min-h-dvh flex items-center justify-center'>
      {/* Background decorations */}
      <div
        className='absolute top-10 left-10 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl animate-bounce'
        style={{ animationDuration: '6s' }}
      ></div>
      <div
        className='absolute bottom-10 right-10 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl animate-bounce'
        style={{ animationDelay: '3s', animationDuration: '6s' }}
      ></div>

      <div className='container mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
        {/* Header */}
        <div className='text-center space-y-4 mb-16'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 drop-shadow-lg'>
            Nuestra Historia
          </h2>
          <p className='text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto drop-shadow-sm'>
            My Bakery nació del sueño de compartir el auténtico sabor de la panadería tradicional.
            Desde 2003, hemos estado sirviendo a nuestra comunidad con productos frescos, elaborados
            con recetas que han pasado de generación en generación.
          </p>
        </div>

        {/* Desktop Timeline - Horizontal Slider */}
        <div className='hidden lg:block relative mb-20'>
          {/* Navigation Buttons */}
          <div className='absolute left-0 top-1/2 transform -translate-y-1/2 z-20'>
            <Button
              variant='glass'
              onClick={prevSlide}
              className='hover:scale-110 shadow-lg'
              disabled={currentSlide === 0}
            >
              <CoffeeIcon className='h-5 w-5' />
            </Button>
          </div>
          <div className='absolute right-0 top-1/2 transform -translate-y-1/2 z-20'>
            <Button
              variant='glass'
              onClick={nextSlide}
              className='hover:scale-110 shadow-lg'
              disabled={currentSlide === maxSlides}
            >
              <CoffeeIcon className='h-5 w-5' />
            </Button>
          </div>

          {/* Timeline Container */}
          <div className='mx-12 relative overflow-hidden'>
            {/* Timeline Line */}
            <div className='absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 rounded-full transform -translate-y-1/2 z-10'>
              <div
                className={`h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-2000 ease-out ${
                  isVisible ? 'w-full' : 'w-0'
                }`}
              />
            </div>

            {/* Timeline Items Slider */}
            <div
              className='flex flex-nowrap transition-transform duration-[3000ms] ease-in-out'
              style={{
                transform: `translateX(-${(currentSlide * 100) / (maxSlides + 1)}%)`,
                width: `${(timelineEvents.length / itemsPerView) * 100}%`,
                minHeight: '450px'
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
                    variant='glass'
                    className={`${event.position === 'top' ? 'order-1 mb-8' : 'order-3 mt-8'}`}
                  >
                    <div className='w-72 shadow-xl hover:shadow-2xl group'>
                      <div className='p-6 text-center'>
                        <Image
                          src={event.image || PlaceholderImage}
                          alt='Panadería My Bakery con productos frescos'
                          className='w-full h-64 object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1'
                          placeholder='blur'
                          priority
                        />

                        <h3 className='text-lg font-bold text-amber-600 mb-2 drop-shadow-sm'>
                          {event.title}
                        </h3>
                        <p className='text-sm text-gray-600 dark:text-gray-400 leading-relaxed'>
                          {event.description}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Year Badge */}
                  <div className='order-2 relative'>
                    <div className='w-16 h-16 backdrop-blur-md backdrop-saturate-180 bg-amber-600/20 dark:bg-amber-600/15 border border-amber-600/30 dark:border-amber-500/20 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group'>
                      <event.icon className='h-6 w-6 text-amber-600 group-hover:rotate-12 transition-transform duration-300' />
                    </div>
                    <div className='absolute -bottom-8 left-1/2 transform -translate-x-1/2'>
                      <span className='text-2xl font-bold text-amber-600 drop-shadow-lg whitespace-nowrap'>
                        {event.year}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slide Indicators */}
          <div className='flex justify-center mt-8 space-x-2'>
            {Array.from({ length: maxSlides + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
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
          <div className='absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 rounded-full'>
            <div
              className={`w-full bg-gradient-to-b from-amber-500 to-orange-500 rounded-full transition-all duration-2000 ease-out ${
                isVisible ? 'h-full' : 'h-0'
              }`}
            />
          </div>

          {/* Vertical Timeline Items */}
          <div className='space-y-12'>
            {timelineEvents.map((event, index) => (
              <div
                key={index}
                className={`flex items-start space-x-6 transition-all duration-700 ${
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
                  <div className='absolute -bottom-8 left-1/2 transform -translate-x-1/2'>
                    <span className='text-lg font-bold text-amber-600 drop-shadow-lg whitespace-nowrap'>
                      {event.year}
                    </span>
                  </div>
                </div>

                {/* Content Card */}
                <div className='flex-1 mt-2'>
                  <Card variant='glass-light' className='shadow-xl hover:shadow-2xl group'>
                    <Card className='p-6'>
                      <div className='flex items-start space-x-4'>
                        <div className='w-16 h-16 rounded-full overflow-hidden backdrop-blur-md backdrop-saturate-180 bg-amber-600/20 dark:bg-amber-600/15 border border-amber-600/30 dark:border-amber-500/20 flex-shrink-0'>
                          <Image
                            src={event.image || PlaceholderImage}
                            alt='Panadería My Bakery con productos frescos'
                            className='w-full h-64 object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1'
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
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {features.map((feature, index) => (
            <Card
              key={index}
              variant='glass-light'
              className={`hover:shadow-xl transition-all duration-500 hover:scale-105 group ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
              style={{ transitionDelay: `${(index + 5) * 200}ms` }}
            >
              <Card className='p-6 text-center'>
                <div className='w-16 h-16 backdrop-blur-md backdrop-saturate-180 bg-amber-600/20 dark:bg-amber-600/15 border border-amber-600/30 dark:border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:rotate-12'>
                  <feature.icon className='h-8 w-8 text-amber-600' />
                </div>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 drop-shadow-sm'>
                  {feature.title}
                </h3>
                <p className='text-gray-600 dark:text-gray-400 text-sm leading-relaxed'>
                  {feature.description}
                </p>
              </Card>
            </Card>
          ))}
        </div>

        {/* Bottom Description */}
        <div className='text-center mt-16'>
          <p className='text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed drop-shadow-sm'>
            Creemos que la buena comida une a las personas, y cada día trabajamos para crear
            momentos especiales a través de nuestros panes, pasteles y café excepcional.
          </p>
        </div>
      </div>
    </section>
  );
}
