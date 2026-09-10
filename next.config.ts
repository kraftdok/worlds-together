import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vinext inspects multipart requests before dispatching route handlers.
  // Keep that envelope above our independently enforced 8 MB upload limit.
  experimental: { serverActions: { bodySizeLimit: '9mb' } },
};

export default nextConfig;
