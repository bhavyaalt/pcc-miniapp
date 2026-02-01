import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 192, height: 192 };
export const contentType = 'image/png';

export default function Icon192() {
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
        <svg width="140" height="140" viewBox="0 0 24 24">
          <circle cx="8" cy="14" r="5.5" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="1.5"/>
          <circle cx="12" cy="8" r="5.5" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="1.5"/>
          <circle cx="16" cy="14" r="5.5" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="1.5"/>
        </svg>
      </div>
    ),
    { ...size }
  );
}
