import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/db';

// Image metadata
export const alt = 'Next App - Modern Business Management Platform for Client Services, News, and Analytics';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Fetch app settings for OG image
async function getAppSettings() {
  try {
    const settings = await prisma.app_settings.findFirst();
    return settings;
  } catch (error) {
    console.error('Failed to fetch app settings for OG image:', error);
    return null;
  }
}

// Image generation
export default async function Image() {
  const settings = await getAppSettings();
  
  // If custom OG image is set, redirect to it
  if (settings?.og_image_url) {
    // Return a response that redirects to the custom image
    // Note: For direct image URL, we need to use the ImageResponse with the fetched image
    try {
      const imageResponse = await fetch(settings.og_image_url);
      const imageBuffer = await imageResponse.arrayBuffer();
      return new Response(imageBuffer, {
        headers: {
          'Content-Type': imageResponse.headers.get('Content-Type') || 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch (error) {
      console.error('Failed to fetch custom OG image:', error);
      // Fall back to generated image
    }
  }
  
  // Generate default OG image
  const title = settings?.site_title_en || 'Next App';
  const description = settings?.site_description_en || 'Streamline client management, track analytics, publish news updates, and grow your business with our modern platform';
  
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
            padding: '60px',
            maxWidth: '1100px',
          }}
        >
          {/* Logo Box - Text Based */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '50px',
            }}
          >
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '20px',
                backgroundColor: '#3B82F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '20px',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div
                style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                NA
              </div>
            </div>
            <div
              style={{
                fontSize: '56px',
                fontWeight: 'bold',
                color: 'white',
                textShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              }}
            >
              {title}
            </div>
          </div>

          {/* Main Headline */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: '62px',
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              marginBottom: '25px',
              textShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              lineHeight: '1.2',
            }}
          >
            <div>Your Complete Business</div>
            <div>Management Solution</div>
          </div>

          {/* App Description */}
          <div
            style={{
              fontSize: '28px',
              color: 'rgba(255, 255, 255, 0.95)',
              textAlign: 'center',
              maxWidth: '950px',
              lineHeight: '1.5',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              marginBottom: '10px',
            }}
          >
            {description}
          </div>

          {/* Features badges */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '45px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                padding: '14px 28px',
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                borderRadius: '14px',
                color: 'white',
                fontSize: '22px',
                fontWeight: '600',
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              Client Management
            </div>
            <div
              style={{
                padding: '14px 28px',
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                borderRadius: '14px',
                color: 'white',
                fontSize: '22px',
                fontWeight: '600',
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              News Publishing
            </div>
            <div
              style={{
                padding: '14px 28px',
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                borderRadius: '14px',
                color: 'white',
                fontSize: '22px',
                fontWeight: '600',
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              Analytics Dashboard
            </div>
          </div>
          
          {/* Call to Action */}
          <div
            style={{
              marginTop: '50px',
              padding: '18px 45px',
              backgroundColor: 'white',
              borderRadius: '16px',
              color: '#667eea',
              fontSize: '26px',
              fontWeight: 'bold',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            }}
          >
            Get Started Today →
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
