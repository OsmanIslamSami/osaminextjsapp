import { ImageResponse } from 'next/og';

// Image metadata
export const alt = 'Next App - Modern Business Platform';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
          }}
        >
          {/* App Icon/Logo */}
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '24px',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '64px',
              fontWeight: 'bold',
              color: '#667eea',
              marginBottom: '40px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
            }}
          >
            📱
          </div>

          {/* App Title */}
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              marginBottom: '20px',
              textShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            }}
          >
            Next App
          </div>

          {/* App Description */}
          <div
            style={{
              fontSize: '32px',
              color: 'rgba(255, 255, 255, 0.95)',
              textAlign: 'center',
              maxWidth: '900px',
              lineHeight: '1.4',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            Modern Next.js Application with Advanced Features
          </div>

          {/* Features badges */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '40px',
            }}
          >
            <div
              style={{
                padding: '12px 24px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '24px',
                fontWeight: '600',
                backdropFilter: 'blur(10px)',
              }}
            >
              📰 News
            </div>
            <div
              style={{
                padding: '12px 24px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '24px',
                fontWeight: '600',
                backdropFilter: 'blur(10px)',
              }}
            >
              👥 Clients
            </div>
            <div
              style={{
                padding: '12px 24px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '24px',
                fontWeight: '600',
                backdropFilter: 'blur(10px)',
              }}
            >
              📊 Dashboard
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
