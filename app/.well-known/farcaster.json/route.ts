import { NextResponse } from 'next/server';

const APP_URL = process.env.NEXT_PUBLIC_URL || 'https://pcc-miniapp.vercel.app';

export async function GET() {
  const config = {
    accountAssociation: {
      header: process.env.FARCASTER_HEADER || "",
      payload: process.env.FARCASTER_PAYLOAD || "",
      signature: process.env.FARCASTER_SIGNATURE || "",
    },
    frame: {
      version: "next",
      name: "Peer Credit Circles",
      iconUrl: `${APP_URL}/icon.png`,
      homeUrl: APP_URL,
      imageUrl: `${APP_URL}/og-image.png`,
      buttonTitle: "Launch PCC",
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: "#0a0a0f",
      webhookUrl: `${APP_URL}/api/webhook`,
    },
  };

  return NextResponse.json(config);
}
