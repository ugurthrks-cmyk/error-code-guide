/** @type {import('next').Next.Config} */
const nextConfig = {
  eslint: {
    // Build sırasında lint hatalarını görmezden gel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Varsa tip hatalarını da görmezden gelmek için (isteğe bağlı)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;


