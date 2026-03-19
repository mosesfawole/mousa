import type { NextConfig } from "next";
import { setDefaultResultOrder } from "dns";

setDefaultResultOrder("ipv4first");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
