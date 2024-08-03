const nextConfig = {
  env: {},
  images: {},
  async redirects() {
    return [
      {
        source: "/",
        destination: "/swap",
        permanent: true,
      },
    ];
  },
};
module.exports = nextConfig;
