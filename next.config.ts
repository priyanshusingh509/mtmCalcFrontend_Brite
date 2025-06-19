import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins:[
    'http://192.168.4.200:3000',
    'http://192.168.4.200:3002',
    'http://192.168.4.199',
    'http://192.168.4.198:3000',
    'http://192.168.4.198:3002'
  ]
  
};

export default nextConfig;