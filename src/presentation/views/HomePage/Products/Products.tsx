'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { Card } from '@/components/atoms';
import BreadTomatoImage from '@/images/breadTomato.avif';
import CroissantImage from '@/images/croissants.avif';
import EnsaimadasImage from '@/images/ensaimadas.avif';
import NapolitanasImage from '@/images/napolitanas.avif';
import { useTranslation } from '@/shared/hooks';

export function Products() {
  const { t } = useTranslation();

  const [visibleCards, setVisibleCards] = useState<number[]>([]);

  const products = [
    {
      name: 'Croissant',
      description:
        'Hojaldre dorado y crujiente, hecho con mantequilla de calidad y laminado a mano para una textura ligera y delicada.',
      image: CroissantImage
    },
    {
      name: 'Ensaimadas',
      description:
        'Delicada espiral de masa suave, fermentada lentamente y espolvoreada con azúcar glas. Un clásico balear con alma catalana.',
      image: EnsaimadasImage
    },
    {
      name: 'Pan Tomate',
      description:
        'Bizcocho tradicional catalán, ligero y esponjoso, elaborado con huevos frescos y un toque de vainilla natural. Perfecto para acompañar el café.',
      image: BreadTomatoImage
    },
    {
      name: 'Napolitanas',
      description:
        'Delicioso hojaldre relleno de chocolate fundido o crema pastelera, horneado hasta alcanzar una cobertura crujiente y dorada.',
      image: NapolitanasImage
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = Number.parseInt(entry.target.getAttribute('data-index') || '0', 10);
            setVisibleCards(prev => [...prev, index]);
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section id='products' className='relative min-h-dvh flex items-center justify-cente pt-24'>
      {/* Background elements */}
      <div className='absolute -top-1/12 left-1/3 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl'></div>
      <div className='absolute top-1/4 -right-0 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl'></div>
      <div className='absolute top-2/3 -left-0 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl'></div>

      <div className='flex flex-col items-center gap-16 relative z-10'>
        {/* Header */}
        <div className='text-center items-center flex flex-col gap-4 animate-fade-in'>
          <h2 className='text-60-96 leading-normal font-bold text-gray-900 dark:text-gray-100 drop-shadow-lg'>
            {t('products.title')}
          </h2>
          <p className='text-2xl leading-normal text-gray-600 dark:text-gray-400 max-w-2xl drop-shadow-sm'>
            {t('products.description')}
          </p>
        </div>

        {/* Products Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {products.map((product, index) => (
            <Card
              variant='glass'
              key={index}
              className={`product-card max-w-md group rounded-3xl transition-[opacity,translate] duration-700 ease-in-out  ${
                visibleCards.includes(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
              data-index={index}
              style={{
                transitionDelay: `${index * 100}ms`
              }}
            >
              <div className='rounded-3xl overflow-hidden'>
                <Image
                  src={product.image || CroissantImage}
                  alt='Panadería My Bakery con productos frescos'
                  className='w-full h-full object-cover transition-all duration-700 group-hover:scale-110'
                  placeholder='blur'
                  priority
                />
              </div>
              <div className='flex flex-col gap-4 p-6'>
                <h3 className='text-2xl leading-normal font-semibold text-gray-900 dark:text-gray-100 group-hover:text-amber-600 transition-colors duration-300 drop-shadow-sm'>
                  {product.name}
                </h3>
                <p className='text-base leading-normal text-gray-600 dark:text-gray-400 drop-shadow-sm'>
                  {product.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
