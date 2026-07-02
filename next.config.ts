import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // Dinonaktifkan saat ngoding agar tidak error caching
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Anda bisa menaruh config Next.js lainnya di sini jika ada
};

export default withPWA(nextConfig);