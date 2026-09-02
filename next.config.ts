import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow testing the dev server from a phone on the same network.
  allowedDevOrigins: ["192.168.1.252"],
};

export default nextConfig;
