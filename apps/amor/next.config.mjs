/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sburksnwmywzytpctjws.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "https://clyrtraining.vercel.app/t/amor/tenant/login",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
