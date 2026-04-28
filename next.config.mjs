/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rdmaunablob.blob.core.windows.net",
      },
      {
        protocol: "https",
        hostname: "rdmaunablob2.blob.core.windows.net",
      },
    ],
  },
};

export default nextConfig;
