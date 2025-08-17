/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    WATSONX_API_KEY: process.env.WATSONX_API_KEY,
    WATSONX_URL: process.env.WATSONX_URL,
    WATSONX_PROJECT_ID: process.env.WATSONX_PROJECT_ID,
  },
}
module.exports = nextConfig
