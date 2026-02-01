import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: '8px',
        }}
      >
        {/* Three overlapping circles representing peer circles */}
        <div style={{ display: 'flex', position: 'relative', width: 24, height: 24 }}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 4,
              width: 12,
              height: 12,
              borderRadius: '50%',
              border: '2px solid white',
              background: 'rgba(255,255,255,0.2)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 6,
              top: 0,
              width: 12,
              height: 12,
              borderRadius: '50%',
              border: '2px solid white',
              background: 'rgba(255,255,255,0.2)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 12,
              top: 4,
              width: 12,
              height: 12,
              borderRadius: '50%',
              border: '2px solid white',
              background: 'rgba(255,255,255,0.2)',
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
