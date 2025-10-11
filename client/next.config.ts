import type { NextConfig } from "next";
import dotenv from "dotenv";
dotenv.config();

const nextConfig: NextConfig = {
  env: {
    UI_PORT: process.env.UI_PORT,
    API_URL: process.env.API_URL
  },
  reactStrictMode: true,
};

export default nextConfig;
