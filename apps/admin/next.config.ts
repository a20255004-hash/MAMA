import type { NextConfig } from "next";

// En GitHub Pages cada aplicación vive en una subcarpeta del sitio; en local, en la raíz.
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const config: NextConfig = {
  output: "export", // sitio estático: es lo que GitHub Pages puede servir
  basePath: base || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  transpilePackages: ["@illari/ui", "@illari/db"],
  poweredByHeader: false,
};

export default config;
