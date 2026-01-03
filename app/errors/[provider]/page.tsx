import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getErrorCodesByProvider, type ErrorProvider } from '@/lib/errors';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

interface PageProps {
  params: Promise<{
    provider: string;
  }>;
}

const providerNames: Record<ErrorProvider, string> = {
  http: 'HTTP',
  aws: 'AWS',
  azure: 'Azure',
  gcp: 'GCP',
};

const providerDescriptions: Record<ErrorProvider, string> = {
  http: 'Standard HTTP status codes for web applications and APIs',
  aws: 'Amazon Web Services error codes and exceptions',
  azure: 'Microsoft Azure service error codes and exceptions',
  gcp: 'Google Cloud Platform error codes and exceptions',
};

export async function generateMetadata({ params }: PageProps) {
  const { provider } = await params;
  const providerKey = provider.toLowerCase() as ErrorProvider;

  if (!['http', 'aws', 'azure', 'gcp'].includes(providerKey)) {
    return {
      title: 'Provider Not Found',
      description: 'The requested provider could not be found.',
    };
  }

  const errorCodes = getErrorCodesByProvider(providerKey);
  const providerName = providerNames[providerKey];

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return generateSEOMetadata({
    title: `${providerName} Error Codes`,
    description: `${providerDescriptions[providerKey]}. Browse ${errorCodes.length} error codes with detailed explanations, troubleshooting tips, and code examples.`,
    provider: providerKey,
    url: `${baseUrl.replace(/\/$/, '')}/errors/${provider}`,
  });
}

export default async function ProviderPage({ params }: PageProps) {
  const { provider } = await params;
  const providerKey = provider.toLowerCase() as ErrorProvider;

  if (!['http', 'aws', 'azure', 'gcp'].includes(providerKey)) {
    notFound();
  }

  const errorCodes = getErrorCodesByProvider(providerKey);
  const providerName = providerNames[providerKey];
  const providerDescription = providerDescriptions[providerKey];

  // Sort error codes by code value
  const sortedErrorCodes = [...errorCodes].sort((a, b) => {
    // For HTTP codes, sort numerically
    if (providerKey === 'http') {
      const aNum = parseInt(a.code);
      const bNum = parseInt(b.code);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
    }
    // For other providers, sort alphabetically
    return a.code.localeCompare(b.code);
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/errors"
            className="text-gray-400 hover:text-gray-200 transition-colors text-sm"
          >
            ← All Errors
          </Link>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded-md bg-blue-500/20 text-blue-400 text-sm font-mono font-semibold">
            {providerKey.toUpperCase()}
          </span>
          <h1 className="text-4xl font-bold text-white">
            {providerName} Error Codes
          </h1>
        </div>
        <p className="text-xl text-gray-400 max-w-3xl">
          {providerDescription}
        </p>
        <div className="mt-4 text-sm text-gray-500">
          {errorCodes.length} error code{errorCodes.length !== 1 ? 's' : ''} available
        </div>
      </header>

      {/* Error Codes Grid */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedErrorCodes.map((error) => (
            <Link
              key={error.code}
              href={`/errors/${providerKey}/${error.code}`}
              className="p-5 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-900 hover:border-gray-700 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="px-2 py-1 rounded text-xs font-mono font-semibold bg-blue-500/20 text-blue-400 shrink-0">
                  {providerKey.toUpperCase()}
                </span>
                <span className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors font-mono break-all">
                  {error.code}
                </span>
              </div>
              <h3 className={`text-white font-semibold mb-2 group-hover:text-blue-400 transition-colors break-words ${
                error.name.length > 60 ? 'text-xs' : error.name.length > 40 ? 'text-sm' : ''
              }`}>
                {error.name}
              </h3>
              <p className="text-gray-400 text-sm line-clamp-3 mb-3">
                {error.description}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {error.causes.length} cause{error.causes.length !== 1 ? 's' : ''}
                </span>
                <span className="text-blue-400 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Empty State */}
      {errorCodes.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">
            No error codes found for {providerName}.
          </p>
          <Link
            href="/errors"
            className="mt-4 inline-block text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to All Errors
          </Link>
        </div>
      )}
    </div>
  );
}

