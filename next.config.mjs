/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Next.js Image optimization requires an explicit allowlist of remote
    // domains. picsum and placeholder are used by the seed data for demo
    // products; unsplash is used for category hero images.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "via.placeholder.com" },
    ],
  },
};

export default nextConfig;
