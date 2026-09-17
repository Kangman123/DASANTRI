import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  outputFileTracingIncludes: {
    "/api/**/*": ["./app/generated/prisma/**/*"],
    "/**/*": ["./app/generated/prisma/**/*"],
  },
};

export default nextConfig;