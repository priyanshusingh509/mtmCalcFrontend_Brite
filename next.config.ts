import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins:[
    'http://192.168.40.178:3000',
    'http://192.168.40.178:3002'
  ]
  
};

export default nextConfig;