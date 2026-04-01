import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

// Runtime configuration - using nodejs to enable database queries
export const runtime = 'nodejs';

// Force dynamic rendering (no static optimization)
export const dynamic = 'force-dynamic';

// Image metadata
export const alt = 'Next App - Modern Business Management Platform for Client Services, News, and Analytics';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Revalidate immediately (no caching) to always show latest app settings
export const revalidate = 0;

// Image generation using app settings
export default async function Image() {
  // Fetch app settings from database
  let title = 'Next App';
  let description = 'Streamline client management, track analytics, publish news updates, and grow your business with our modern platform';
  
  try {
    console.log('[OG Image] Fetching app settings from database...');
    const settings = await prisma.app_settings.findFirst();
    
    if (settings) {
      console.log('[OG Image] Settings found:', {
        title_en: settings.site_title_en,
        description_en: settings.site_description_en?.substring(0, 50) + '...',
        og_image_url: settings.og_image_url
      });
      
      // If custom OG image is uploaded, fetch and return it
      if (settings.og_image_url) {
        console.log('[OG Image] Custom OG image found, fetching:', settings.og_image_url);
        try {
          const imageResponse = await fetch(settings.og_image_url);
          if (imageResponse.ok) {
            const imageBuffer = await imageResponse.arrayBuffer();
            console.log('[OG Image] Serving custom uploaded image');
            return new Response(imageBuffer, {
              headers: {
                'Content-Type': imageResponse.headers.get('Content-Type') || 'image/png',
                'Cache-Control': 'public, max-age=3600',
              },
            });
          } else {
            console.error('[OG Image] Failed to fetch custom image, falling back to generated');
          }
        } catch (fetchError) {
          console.error('[OG Image] Error fetching custom image:', fetchError);
        }
      }
      
      // Use English settings for OG image (international standard)
      title = settings.site_title_en || title;
      description = settings.site_description_en || description;
    } else {
      console.log('[OG Image] No settings found in database, using defaults');
    }
  } catch (error) {
    console.error('[OG Image] Failed to fetch app settings:', error);
    // Fall back to default values
  }
  
  console.log('[OG Image] Generating dynamic image with title:', title);
  
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
