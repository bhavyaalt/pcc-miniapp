import type { Metadata, Viewport } from 'next';
import { RootProvider } from './rootProvider';
import FeedbackWidget from './components/FeedbackWidget';
import './globals.css';

const APP_URL = process.env.NEXT_PUBLIC_URL || 'https://pcc-miniapp.vercel.app';

// Farcaster Frame Metadata
const frame = {
  version: "next",
  imageUrl: `${APP_URL}/opengraph-image`,
  button: {
    title: "Launch PCC",
    action: {
      type: "launch_frame",
      name: "Peer Credit Circles",
      url: APP_URL,
      splashImageUrl: `${APP_URL}/opengraph-image`,
      splashBackgroundColor: "#0a0a0f",
    },
  },
};

export const metadata: Metadata = {
  title: 'Peer Credit Circles | Pool Money with Friends',
  description: 'Create investment pools with friends, family, or your community. Invest together, share returns.',
  openGraph: {
    title: 'Peer Credit Circles',
    description: 'Pool money with people you trust. Invest in what you believe in.',
    images: [`${APP_URL}/opengraph-image`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Peer Credit Circles',
    description: 'Pool money with people you trust. Invest in what you believe in.',
    images: [`${APP_URL}/opengraph-image`],
  },
  other: {
    "fc:frame": JSON.stringify(frame),
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0a0f',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <RootProvider>
          {children}
          <FeedbackWidget 
            appId="pcc-miniapp" 
            appName="PCC" 
            triggerAfterActions={3}
          />
        </RootProvider>
      </body>
    </html>
  );
}
