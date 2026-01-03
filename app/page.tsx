'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { getErrorCodesByProvider, type ErrorProvider } from '@/lib/errors';
import { Server, Cloud, Shield, Database, Search, ArrowRight } from 'lucide-react';

const providers: { 
  name: string; 
  value: ErrorProvider; 
  description: string; 
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  {
    name: 'HTTP',
    value: 'http',
    description: 'Standard HTTP status codes for web applications',
    icon: Server,
    color: 'blue',
  },
  {
    name: 'AWS',
    value: 'aws',
    description: 'Amazon Web Services error codes and exceptions',
    icon: Cloud,
    color: 'orange',
  },
  {
    name: 'Azure',
    value: 'azure',
    description: 'Microsoft Azure service error codes',
    icon: Shield,
    color: 'cyan',
  },
  {
    name: 'GCP',
    value: 'gcp',
    description: 'Google Cloud Platform error codes',
    icon: Database,
    color: 'green',
  },
];

const popularSearches = [
  { code: 'HTTP 500', href: '/errors/http/500' },
  { code: 'HTTP 502', href: '/errors/http/502' },
  { code: 'AWS AccessDenied', href: '/errors/aws/AccessDenied' },
  { code: 'S3 SlowDown', href: '/errors/aws/SlowDown' },
  { code: 'Azure AuthorizationFailed', href: '/errors/azure/AuthorizationFailed' },
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/errors?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section with Gradient Background */}
      <section className="relative mb-2 py-12 md:py-20 pb-6">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-blue-600/10 rounded-3xl -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_50%)] -z-10" />
        
        <div className="relative text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Error Code Reference
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Find solutions for Cloud API errors and HTTP status codes. Comprehensive, free, and developer-focused.
          </p>

          {/* Large Search Bar (Functional Input) */}
          <form onSubmit={handleSearch} className="block max-w-2xl mx-auto mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative flex items-center gap-4 px-6 py-5 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl hover:border-gray-700 focus-within:border-gray-700 transition-all">
                <Search className="w-6 h-6 text-gray-500 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search error codes, status codes, or keywords..."
                  className="bg-transparent border-none outline-none text-gray-400 text-lg flex-grow placeholder-gray-500 focus:text-white focus:placeholder-gray-400 pr-14"
                />
                <button
                  type="submit"
                  className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors z-10 relative flex-shrink-0"
                  aria-label="Search"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>

          {/* Popular Searches */}
          <div className="mt-12">
            <p className="text-sm text-gray-500 mb-4">Popular Searches</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {popularSearches.map((search) => (
                <Link
                  key={search.code}
                  href={search.href}
                  className="px-4 py-2 rounded-full bg-gray-900/60 border border-gray-800 text-sm text-gray-300 hover:text-white hover:border-gray-700 hover:bg-gray-900 transition-all"
                >
                  {search.code}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Provider Categories */}
      <section className="mb-2 px-4">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">
          Browse by Provider
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {providers.map((provider) => {
            const errors = getErrorCodesByProvider(provider.value);
            const Icon = provider.icon;
            return (
              <Link
                key={provider.value}
                href={`/errors/${provider.value}`}
                className="group relative p-6 rounded-xl border border-gray-800 bg-gray-900/50 hover:bg-gray-900 hover:border-gray-700 transition-all overflow-hidden"
              >
                {/* Subtle gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/0 to-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-800 group-hover:bg-gray-700 transition-colors">
                      <Icon className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {provider.name}
                    </h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">{provider.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {errors.length} error{errors.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-blue-400 group-hover:translate-x-1 transition-transform inline-block">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SEO Footer Section */}
      <section className="mt-24 mb-2 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">About Error Code Reference</h2>
          <p className="text-gray-400 leading-relaxed">
            Comprehensive database for developers to find solutions for Cloud API errors and HTTP status codes. 
            Our free resource provides detailed explanations, troubleshooting guides, and code examples for errors 
            from AWS, Azure, GCP, and standard HTTP protocols. Whether you're debugging a production issue or 
            learning about error handling, Error Code Reference is your go-to resource for understanding and 
            resolving error codes quickly and efficiently.
          </p>
        </div>
      </section>
    </div>
  );
}
