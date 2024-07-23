/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    serverRuntimeConfig: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      },
    
};

export default nextConfig;
