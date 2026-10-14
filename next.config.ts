import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // A parent package-lock.json can otherwise make Turbopack select the
  // OneDrive parent directory rather than this application as its root.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
