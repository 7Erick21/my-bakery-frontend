'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import { Card } from '@/components/atoms';
import PlaceholderImage from '@/images/placeholder.webp';

export function Products() {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);

  const products = [
    {
      name: 'Pan Artesanal',
      description: 'Pan recién horneado con masa madre tradicional',
      price: `Desde $3.50`,
      image: PlaceholderImage,
      badge: 'products.mostPopular'
    },
    {
      name: 'Pan Artesanal',
      description: 'Pan recién horneado con masa madre tradicional',
      price: `Desde $15.00`,
      image: PlaceholderImage,
      badge: 'products.specialty'
    },
    {
      name: 'Pan Artesanal',
      description: 'Pan recién horneado con masa madre tradicional',
      price: `Desde $4.00`,
      image: PlaceholderImage,
      badge: 'products.new'
    },
    {
      name: 'Pan Artesanal',
      description: 'Pan recién horneado con masa madre tradicional',
      price: `Desde $2.50`,
      image: PlaceholderImage,
      badge: ''
    },
    {
      name: 'Pan Artesanal',
      description: 'Pan recién horneado con masa madre tradicional',
      price: `Desde $3.00`,
      image: PlaceholderImage,
      badge: ''
    },
    {
      name: 'Pan Artesanal',
      description: 'Pan recién horneado con masa madre tradicional',
      price: `Desde $3.00`,
      image: PlaceholderImage,
      badge: ''
    },
    {
      name: 'Pan Artesanal',
      description: 'Pan recién horneado con masa madre tradicional',
      price: `Desde $3.00`,
      image: PlaceholderImage,
      badge: ''
    },
    {
      name: 'Pan Artesanal',
      description: 'Pan recién horneado con masa madre tradicional',
      price: `Desde $3.00`,
      image: PlaceholderImage,
      badge: ''
    },
    {
      name: 'Pan Artesanal',
      description: 'Pan recién horneado con masa madre tradicional',
      price: `Desde $3.00`,
      image: PlaceholderImage,
      badge: ''
    },
    {
      name: 'Pan Artesanal',
      description: 'Pan recién horneado con masa madre tradicional',
      price: `Desde $3.00`,
      image: PlaceholderImage,
      badge: ''
    },
    {
      name: 'Pan Artesanal',
      description: 'Pan recién horneado con masa madre tradicional',
      price: `Desde $3.00`,
      image: PlaceholderImage,
      badge: ''
    },
    {
      name: 'Pan Artesanal',
      description: 'Pan recién horneado con masa madre tradicional',
      price: `Desde $3.00`,
      image: PlaceholderImage,
      badge: ''
    },
    {
      name: 'Pan Artesanal',
      description: 'Pan recién horneado con masa madre tradicional',
      price: `Desde $3.00`,
      image: PlaceholderImage,
      badge: ''
    },
    {
      name: 'Pan Artesanal',
      description: 'Pan recién horneado con masa madre tradicional',
      price: `Desde $3.00`,
      image: PlaceholderImage,
      badge: ''
    },
    {
      name: 'Pan Artesanal',
      description: 'Pan recién horneado con masa madre tradicional',
      price: `Desde $1.50`,
      image: PlaceholderImage,
      badge: 'products.favorite'
    },
    {
      name: 'Pan Artesanal',
      description: 'Pan recién horneado con masa madre tradicional',
      price: `Desde $1.50`,
      image: PlaceholderImage,
      badge: 'products.favorite'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = Number.parseInt(entry.target.getAttribute('data-index') || '0');
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
    <section id='products' className='relative min-h-dvh flex items-center justify-cente'>
      {/* Background elements */}
      <div className='absolute -top-1/12 left-1/3 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl'></div>
      <div className='absolute top-1/4 -right-0 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl'></div>
      <div className='absolute top-2/3 -left-0 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl'></div>

      <div className='container mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
        {/* Header */}
        <div className='text-center space-y-4 mb-16 animate-fade-in'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 drop-shadow-lg'>
            Nuestros Productos
          </h2>
          <p className='text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto drop-shadow-sm'>
            Cada producto está elaborado con ingredientes frescos y técnicas tradicionales para
            ofrecerte la mejor experiencia gastronómica.
          </p>
        </div>

        {/* Products Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {products.map((product, index) => (
            <Card
              variant='glass'
              key={index}
              className={`product-card group rounded-2xl transition-[opacity,transform] duration-500  ${
                visibleCards.includes(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
              data-index={index}
              style={{
                transitionDelay: `${index * 100}ms`
              }}
            >
              <div className='relative overflow-hidden rounded-t-2xl'>
                <Image
                  src={product.image || PlaceholderImage}
                  alt='Panadería My Bakery con productos frescos'
                  className='w-full h-64 object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1'
                  placeholder='blur'
                  priority
                />
                {/* {product.badge && (
                  <Badge className='absolute top-4 left-4 shadow-lg'>{product.badge}</Badge>
                )} */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
              </div>
              <Card variant='glass-light' className='p-6 rounded-b-2xl h-full'>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-amber-600 transition-colors duration-300 drop-shadow-sm'>
                      {product.name}
                    </h3>
                    {/* <span className='text-lg font-bold text-amber-600 animate-pulse drop-shadow-sm'>
                      {product.price}
                    </span> */}
                  </div>
                  <p className='text-gray-600 dark:text-gray-400 drop-shadow-sm'>
                    {product.description}
                  </p>
                </div>
              </Card>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
