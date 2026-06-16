import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 此 monorepo 有多個 lockfile，明確指定本專案為 turbopack root
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
