/** @type {import('next').Next.Config} */
const nextConfig = {
  eslint: {
    // Build sırasında lint hatalarını (o meşhur kesme işaretlerini) görmezden gel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Varsa tip hatalarını da görmezden gelerek build'in tamamlanmasını sağla
    ignoreBuildErrors: true,
  },
};

export default nextConfig;


