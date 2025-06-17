import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins:[
    'http://192.168.4.198',
    'http://192.168.4.199',
    'http://192.168.4.198:3001'
  ]
};

export default nextConfig;