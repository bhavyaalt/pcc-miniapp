const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "http://localhost:3000";

/**
 * MiniApp configuration object. Must follow the mini app manifest specification.
 *
 * @see {@link https://docs.base.org/mini-apps/features/manifest}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },
  baseBuilder: {
    ownerAddress: "",
  },
  miniapp: {
    version: "1",
    name: "Peer Credit Circles",
    subtitle: "Decentralized micro-lending for friends",
    description: "Pool funds with friends. Vote on funding requests. Share rewards proportionally. Built on Base.",
    screenshotUrls: [],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#0a0a0a",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "finance",
    tags: ["defi", "lending", "dao", "base"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Fund projects together. Share rewards.",
    ogTitle: "Peer Credit Circles - Decentralized Lending for Friends",
    ogDescription: "Pool funds with friends, vote on funding requests, and share rewards proportionally. Built on Base.",
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const;
