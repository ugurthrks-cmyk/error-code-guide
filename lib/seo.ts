import { Metadata } from 'next';
import { ErrorCode, ErrorProvider } from './errors';

/**
 * Get the base URL for the site, using environment variable or development fallback.
 * Ensures clean URLs without trailing slashes.
 */
function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) {
    // Remove trailing slash if present
    return envUrl.replace(/\/$/, '');
  }
  // Fallback to localhost for development
  return 'http://localhost:3000';
}

export interface SEOConfig {
  title: string;
  description: string;
  provider?: ErrorProvider;
  code?: string;
  url?: string;
}

export function generateMetadata(config: SEOConfig): Metadata {
  const { title, description, provider, code, url } = config;
  
  const fullTitle = provider && code
    ? `${code} ${title} - ${provider.toUpperCase()} Error Code`
    : title;

  const baseUrl = getBaseUrl();
  const canonicalUrl = url || 
    (provider && code 
      ? `${baseUrl}/errors/${provider}/${code}`
      : baseUrl);

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: 'Error Code Reference',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
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
  };
}

export function generateStructuredData(
  errorCode: ErrorCode,
  provider: ErrorProvider,
  code: string
) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/errors/${provider}/${code}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${code} ${errorCode.name}`,
    description: errorCode.description,
    url,
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Error Code Reference',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Error Code Reference',
    },
    breadcrumb: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Errors',
          item: `${baseUrl}/errors`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: provider.toUpperCase(),
          item: `${baseUrl}/errors/${provider}`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: code,
          item: url,
        },
      ],
    },
  };
}

export function generateSitemapData() {
  const baseUrl = getBaseUrl();
  const routes: string[] = ['/'];

  // Add error code routes
  const providers: ErrorProvider[] = ['http', 'aws', 'azure', 'gcp'];
  
  providers.forEach(provider => {
    routes.push(`/errors/${provider}`);
    // Add individual error code routes
    // This would be expanded with actual error codes
  });

  return routes.map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '/' ? 1.0 : 0.8,
  }));
}


