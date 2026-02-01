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
      version: "1",
      name: "Peer Credit Circles",
      iconUrl: `${APP_URL}/icon-192`,
      homeUrl: APP_URL,
      imageUrl: `${APP_URL}/opengraph-image`,
      buttonTitle: "Launch PCC",
      splashImageUrl: `${APP_URL}/opengraph-image`,
      splashBackgroundColor: "#0a0a0f",
      webhookUrl: `${APP_URL}/api/webhook`,
    },
    // Base Sepolia network configuration
    chains: {
      "eip155:84532": {
        name: "Base Sepolia",
        rpcUrl: "https://sepolia.base.org",
      },
    },
    primaryChainId: "eip155:84532",
  };

  return NextResponse.json(config);
}
