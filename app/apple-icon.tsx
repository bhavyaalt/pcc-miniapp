import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '40px',
        }}
      >
        {/* Three overlapping circles */}
        <div style={{ display: 'flex', position: 'relative', width: 120, height: 100 }}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 20,
              width: 60,
              height: 60,
              borderRadius: '50%',
              border: '4px solid white',
              background: 'rgba(255,255,255,0.2)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 30,
              top: 0,
              width: 60,
              height: 60,
              borderRadius: '50%',
              border: '4px solid white',
              background: 'rgba(255,255,255,0.2)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 60,
              top: 20,
              width: 60,
              height: 60,
              borderRadius: '50%',
              border: '4px solid white',
              background: 'rgba(255,255,255,0.2)',
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
