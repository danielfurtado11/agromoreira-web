import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Image uploads travel through Server Actions on their way to the API,
      // and Next caps action bodies at 1 MB by default. The API allows images
      // up to 5 MB, so allow that plus multipart overhead — the API remains
      // the real gatekeeper with a proper error message.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
