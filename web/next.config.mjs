/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Emits `route/index.html` instead of `route.html`, so plain Apache/Nginx
  // static hosting (the OVH FTP target) serves `/legal/cgv/` without needing
  // any rewrite rules for extensionless URLs.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
