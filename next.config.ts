import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* Sertakan binary media (opsional, via FETCH_MEDIA_BINARIES=1 saat build)
     ke dalam function route unduh klip. */
  outputFileTracingIncludes: {
    "/api/clips/[id]/download": ["./bin/**"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
