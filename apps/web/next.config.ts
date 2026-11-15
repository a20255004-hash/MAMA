import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@casera/ui", "@casera/db"],
  poweredByHeader: false,
};

export default config;
