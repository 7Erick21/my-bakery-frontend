export function OvenAnimate() {
  return (
    <svg
      className='w-80 h-80 mx-auto animate-fade-in'
      viewBox='0 0 400 400'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      {/* Bakery Oven */}
      <rect
        x='50'
        y='150'
        width='300'
        height='200'
        rx='20'
        fill='url(#gradient1)'
        className='animate-scale-in'
        style={{ animationDelay: '0.2s' }}
      />

      {/* Oven Door */}
      <rect
        x='80'
        y='180'
        width='240'
        height='140'
        rx='15'
        fill='url(#gradient2)'
        className='animate-scale-in'
        style={{ animationDelay: '0.4s' }}
      />

      {/* Oven Window */}
      <circle
        cx='200'
        cy='240'
        r='40'
        fill='url(#gradient3)'
        className='animate-scale-in'
        style={{ animationDelay: '0.6s' }}
      />

      {/* Steam Lines */}
      <g className='animate-float'>
        <path
          d='M150 120 Q155 110 150 100'
          stroke='#f19234'
          strokeWidth='3'
          fill='none'
          strokeLinecap='round'
        />
        <path
          d='M200 110 Q205 100 200 90'
          stroke='#f19234'
          strokeWidth='3'
          fill='none'
          strokeLinecap='round'
        />
        <path
          d='M250 120 Q255 110 250 100'
          stroke='#f19234'
          strokeWidth='3'
          fill='none'
          strokeLinecap='round'
        />
      </g>

      {/* Bread Loaves */}
      <ellipse
        cx='180'
        cy='240'
        rx='25'
        ry='15'
        fill='#d2691e'
        className='animate-wiggle'
        style={{ animationDelay: '0.8s' }}
      />
      <ellipse
        cx='220'
        cy='240'
        rx='25'
        ry='15'
        fill='#daa520'
        className='animate-wiggle'
        style={{ animationDelay: '1s' }}
      />

      <defs>
        <linearGradient id='gradient1' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#f19234' />
          <stop offset='100%' stopColor='#ed7314' />
        </linearGradient>
        <linearGradient id='gradient2' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#8b4513' />
          <stop offset='100%' stopColor='#a0522d' />
        </linearGradient>
        <linearGradient id='gradient3' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#ffd700' />
          <stop offset='100%' stopColor='#ffa500' />
        </linearGradient>
        <linearGradient id='textGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#f19234' />
          <stop offset='100%' stopColor='#ed7314' />
        </linearGradient>
      </defs>
    </svg>
  );
}
