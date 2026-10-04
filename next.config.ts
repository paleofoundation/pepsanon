import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep canonical and verification metadata in the initial HTML head for every crawler.
  htmlLimitedBots: /.*/,
  /* config options here */
};

export default nextConfig;
