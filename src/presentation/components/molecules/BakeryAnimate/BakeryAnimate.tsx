export function BakeryAnimate() {
  return (
    <svg
      className='w-64 h-64 mx-auto'
      viewBox='0 0 300 300'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      {/* Baker's Hat */}
      <path
        d='M150 50 C120 50, 100 70, 100 100 L200 100 C200 70, 180 50, 150 50 Z'
        className='animate-bounce-slow fill-gray-400 dark:fill-gray-200'
      />

      {/* Hat Top */}
      <ellipse
        cx='150'
        cy='45'
        rx='30'
        ry='15'
        className='animate-bounce-slow fill-gray-400 dark:fill-gray-200'
        style={{ animationDelay: '0.2s' }}
      />

      {/* Face */}
      <circle cx='150' cy='130' r='40' fill='#fdbcb4' className='animate-scale-in' />

      {/* Eyes */}
      <circle cx='135' cy='125' r='3' fill='#333' className='animate-fade-in' />
      <circle cx='165' cy='125' r='3' fill='#333' className='animate-fade-in' />

      {/* Mustache */}
      <path
        d='M130 140 Q150 135 170 140'
        stroke='#8b4513'
        strokeWidth='4'
        fill='none'
        strokeLinecap='round'
        className='animate-wiggle'
      />

      {/* Body */}
      <rect
        x='120'
        y='170'
        width='60'
        height='80'
        rx='30'
        className='animate-fade-in fill-gray-400 dark:fill-gray-200'
        style={{ animationDelay: '0.5s' }}
      />

      {/* Arms */}
      <circle cx='90' cy='200' r='20' fill='#fdbcb4' className='animate-float' />
      <circle
        cx='210'
        cy='200'
        r='20'
        fill='#fdbcb4'
        className='animate-float'
        style={{ animationDelay: '0.5s' }}
      />

      {/* Bread in hands */}
      <ellipse cx='85' cy='195' rx='12' ry='8' fill='#daa520' className='animate-spin-slow' />
      <ellipse
        cx='215'
        cy='195'
        rx='12'
        ry='8'
        fill='#d2691e'
        className='animate-spin-slow'
        style={{ animationDelay: '1s' }}
      />

      {/* Floating ingredients */}
      <g className='animate-float'>
        <circle cx='60' cy='80' r='4' fill='#f5deb3' />
        <circle cx='240' cy='90' r='3' fill='#daa520' />
        <circle cx='80' cy='120' r='2' fill='#8b4513' />
      </g>

      <g className='animate-float' style={{ animationDelay: '1s' }}>
        <circle cx='220' cy='60' r='3' fill='#f5deb3' />
        <circle cx='50' cy='150' r='4' fill='#daa520' />
        <circle cx='250' cy='130' r='2' fill='#d2691e' />
      </g>
    </svg>
  );
}
