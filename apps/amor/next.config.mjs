/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/admin',
        destination: 'https://clyrtraining.vercel.app/t/amor/tenant/login',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
