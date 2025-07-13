/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from '@vercel/og';

export async function GET() {
  try {
    const font = await fetch(
      new URL('../../../src/presentation/assets/fonts/LobsterTwo-Regular.ttf', import.meta.url)
    ).then(res => res.arrayBuffer());

    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(to bottom right, #F97316, #F59E0B)',
            fontFamily: '"Lobster Two"',
            color: 'white',
            textAlign: 'center',
            padding: '40px'
          }}
        >
          <img
            src='https://my-bakery-frontend-delta.vercel.app/my-bakery-logo.jpg'
            alt='My Bakery Logo'
            width={200}
            height={200}
            style={{ borderRadius: '20px', marginBottom: '40px' }}
          />
          <h1 style={{ fontSize: '72px', margin: 0 }}>My Bakery</h1>
          <p style={{ fontSize: '36px', margin: '16px 0 8px' }}>Panadería Artesanal</p>
          <p style={{ fontSize: '24px', maxWidth: '800px' }}>
            Panes frescos, pasteles y dulces hechos con amor
          </p>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Lobster Two',
            data: font,
            style: 'normal'
          }
        ]
      }
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return new Response('OG Image generation failed', { status: 500 });
  }
}
