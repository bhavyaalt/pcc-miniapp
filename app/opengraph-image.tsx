import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Peer Credit Circles - Pool Money with Friends';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Background circles decoration */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -150,
            left: -100,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)',
          }}
        />

        {/* Logo - Three overlapping circles */}
        <div style={{ display: 'flex', marginBottom: 40 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '4px solid #6366f1',
              background: 'rgba(99,102,241,0.2)',
              marginRight: -20,
            }}
          />
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '4px solid #8b5cf6',
              background: 'rgba(139,92,246,0.2)',
              marginRight: -20,
              marginTop: -20,
            }}
          />
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '4px solid #a855f7',
              background: 'rgba(168,85,247,0.2)',
            }}
          />
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: 20,
          }}
        >
          Peer Credit Circles
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            color: '#a1a1aa',
            marginBottom: 40,
          }}
        >
          Pool Money with People You Trust
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: 40,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: '#d4d4d8',
              fontSize: 24,
            }}
          >
            <span style={{ color: '#6366f1' }}>●</span>
            Create Pools
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: '#d4d4d8',
              fontSize: 24,
            }}
          >
            <span style={{ color: '#8b5cf6' }}>●</span>
            Invest Together
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: '#d4d4d8',
              fontSize: 24,
            }}
          >
            <span style={{ color: '#a855f7' }}>●</span>
            Share Returns
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 20,
            color: '#71717a',
          }}
        >
          Built on Base • Farcaster Mini App
        </div>
      </div>
    ),
    { ...size }
  );
}
