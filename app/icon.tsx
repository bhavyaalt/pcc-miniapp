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
          borderRadius: '6px',
        }}
      >
        {/* Three overlapping circles - cleaner design */}
        <svg width="24" height="24" viewBox="0 0 24 24">
          <circle cx="8" cy="14" r="6" fill="none" stroke="white" strokeWidth="2" opacity="0.9"/>
          <circle cx="12" cy="8" r="6" fill="none" stroke="white" strokeWidth="2" opacity="0.9"/>
          <circle cx="16" cy="14" r="6" fill="none" stroke="white" strokeWidth="2" opacity="0.9"/>
        </svg>
      </div>
    ),
    { ...size }
  );
}
