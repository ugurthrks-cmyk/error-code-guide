import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import EnableContextMenu from '@/components/EnableContextMenu';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Senin harika dinamik URL mantığın:
const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export const metadata: Metadata = {
  title: {
    default: 'Error Code Reference - HTTP, AWS, Azure, GCP',
    template: '%s | Error Code Reference',
  },
  description: 'Comprehensive reference for HTTP status codes and cloud provider error codes. Find detailed explanations, troubleshooting tips, and code examples.',
  keywords: ['error codes', 'HTTP status codes', 'AWS errors', 'Azure errors', 'GCP errors', 'API errors', 'troubleshooting'],
  authors: [{ name: 'Error Code Reference' }],
  creator: 'Error Code Reference',
  
  // 1. Base URL zaten var (Süper)
  metadataBase: new URL(baseUrl),

  // 👇 2. EKSİK OLAN PARÇA BU (Bunu eklemezsen kopya içerik sorunu çözülmez)
  alternates: {
    canonical: '/',
  },

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'Error Code Reference',
    title: 'Error Code Reference - HTTP, AWS, Azure, GCP',
    description: 'Comprehensive reference for HTTP status codes and cloud provider error codes.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Error Code Reference',
    description: 'Comprehensive reference for HTTP status codes and cloud provider error codes.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Search Console kodunu buraya ekleyebilirsin ama TXT kaydı ile zaten hallettik.
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        <EnableContextMenu />
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-gray-800 mt-16 py-8">
            <div className="container mx-auto px-4 text-center text-sm text-gray-500">
              <p>&copy; {new Date().getFullYear()} Error Code Reference. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}


