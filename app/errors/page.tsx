import Link from 'next/link';
import { getAllErrorCodes, getErrorCodesByProvider, type ErrorProvider } from '@/lib/errors';

const providers: { name: string; value: ErrorProvider; color: string }[] = [
  { name: 'HTTP', value: 'http', color: 'blue' },
  { name: 'AWS', value: 'aws', color: 'orange' },
  { name: 'Azure', value: 'azure', color: 'cyan' },
  { name: 'GCP', value: 'gcp', color: 'green' },
];

interface ErrorsPageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function ErrorsPage({ searchParams }: ErrorsPageProps) {
  const params = await searchParams;
  const searchQuery = params.search?.trim() || '';
  
  const allErrors = getAllErrorCodes();
  
  // Filter errors if search query exists
  const filteredErrors = searchQuery
    ? allErrors.filter((error) => {
        const codeStr = String(error.code).toLowerCase();
        const nameStr = error.name.toLowerCase();
        const searchLower = searchQuery.toLowerCase();
        return codeStr.includes(searchLower) || nameStr.includes(searchLower);
      })
    : allErrors;
  
  const hasSearchQuery = searchQuery.length > 0;
  
  // Build title text
  const pageTitle = hasSearchQuery 
    ? filteredErrors.length > 0 
      ? `Search Results (${filteredErrors.length})`
      : 'Search Results'
    : 'Error Code Reference';
  
  // Build description text
  const pageDescription = hasSearchQuery
    ? `Searching for: "${searchQuery}"`
    : 'Comprehensive reference for HTTP status codes and cloud provider error codes.';

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          {pageTitle}
        </h1>
        <p className="text-xl text-gray-400">
          {pageDescription}
        </p>
      </header>

      {/* Only show category cards if no search query */}
      {!hasSearchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {providers.map((provider) => {
            const errors = getErrorCodesByProvider(provider.value);
            return (
              <Link
                key={provider.value}
                href={`/errors/${provider.value}`}
                className="p-6 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-900 hover:border-gray-700 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    {provider.name}
                  </h2>
                  <span className="text-3xl font-mono text-gray-600 group-hover:text-gray-400 transition-colors">
                    {errors.length}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">
                  {errors.length} error code{errors.length !== 1 ? 's' : ''} available
                </p>
              </Link>
            );
          })}
        </div>
      )}

      <section>
        <h2 className="text-2xl font-semibold text-white mb-6">
          {hasSearchQuery ? 'Matching Error Codes' : 'All Error Codes'}
        </h2>
        
        {filteredErrors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-2">
              No errors found for <span className="text-white font-semibold">&quot;{searchQuery}&quot;</span>
            </p>
            <p className="text-gray-500 text-sm">
              Try searching for a different error code or keyword.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredErrors.map((error) => (
              <Link
                key={`${error.provider}-${error.code}`}
                href={`/errors/${error.provider}/${error.code}`}
                className="p-4 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-900 hover:border-gray-700 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="px-2 py-1 rounded text-xs font-mono font-semibold bg-blue-500/20 text-blue-400 shrink-0">
                    {error.provider.toUpperCase()}
                  </span>
                  <span className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors font-mono break-all">
                    {error.code}
                  </span>
                </div>
                <h3 className={`text-white font-semibold mb-1 break-words ${
                  error.name.length > 60 ? 'text-xs' : error.name.length > 40 ? 'text-sm' : ''
                }`}>
                  {error.name}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2">{error.description}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
