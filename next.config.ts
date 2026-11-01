import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // En desarrollo, sin token de Blob, las imágenes se suben por Server Action a public/uploads.
  // En producción van directo del navegador a Vercel Blob y aplica el límite normal (1 MB).
  ...(process.env.NODE_ENV === "development" && {
    experimental: { serverActions: { bodySizeLimit: "9mb" } },
  }),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
