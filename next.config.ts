import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The homepage brand marquee lists public/brands/ at runtime with `fs`. On
  // some hosts (e.g. Vercel) files under public/ aren't on the server's
  // filesystem unless traced into the build — this bundles them so the marquee
  // finds the logos in production too. Harmless on Node hosts (Cloud Run).
  outputFileTracingIncludes: {
    "/": ["./public/brands/**/*"],
  },
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
