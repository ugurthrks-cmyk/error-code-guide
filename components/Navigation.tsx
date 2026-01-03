'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Search from './Search'; // 👈 1. Arama bileşenini buraya çağırdık

export default function Navigation() {
  const pathname = usePathname();
  const isHomepage = pathname === '/';

  return (
    <nav className="border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Sol Taraf: Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-white hover:text-blue-400 transition-colors"
          >
            Error Code Reference
          </Link>

          {/* Sağ Taraf: Linkler ve Arama */}
          <div className="flex items-center space-x-6">
            <Link
              href="/errors"
              className="text-gray-400 hover:text-gray-200 transition-colors hidden md:block" 
              // (Not: Ekranda yer kalmazsa mobilde linkleri gizleyip sadece aramayı bırakabiliriz, şimdilik böyle kalsın)
            >
              All Errors
            </Link>
            <Link
              href="/errors/http"
              className="text-gray-400 hover:text-gray-200 transition-colors hidden sm:block"
            >
              HTTP
            </Link>
            <Link
              href="/errors/aws"
              className="text-gray-400 hover:text-gray-200 transition-colors hidden sm:block"
            >
              AWS
            </Link>
            <Link
              href="/errors/azure"
              className="text-gray-400 hover:text-gray-200 transition-colors hidden sm:block"
            >
              Azure
            </Link>
            <Link
              href="/errors/gcp"
              className="text-gray-400 hover:text-gray-200 transition-colors hidden sm:block"
            >
              GCP
            </Link>

            {/* 👇 2. Arama Kutusunu En Sona Ekledik - Hidden on Homepage 👇 */}
            {!isHomepage && (
              <div className="pl-2 border-l border-gray-800 ml-2">
                <Search />
              </div>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}


