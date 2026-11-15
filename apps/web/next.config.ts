import type { NextConfig } from "next";

// En GitHub Pages el sitio vive en /<nombre-del-repositorio>; en local, en la raíz.
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const config: NextConfig = {
  output: "export", // sitio estático: es lo que GitHub Pages puede servir
  basePath: base || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  transpilePackages: ["@illari/ui", "@illari/db", "three"],
  poweredByHeader: false,
};

export default config;
