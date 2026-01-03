import { notFound } from 'next/navigation';
import { getErrorCode, type ErrorProvider } from '@/lib/errors';
import { generateStructuredData } from '@/lib/seo';
import type { Metadata } from 'next';
import ErrorPage from '@/components/ErrorPage';

interface PageProps {
  params: Promise<{
    provider: string;
    code: string;
  }>;
}

/**
 * Get the base URL for the site, using environment variable or development fallback.
 * Ensures clean URLs without double slashes.
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

/**
 * Build a clean canonical URL by joining base URL with path segments.
 * Prevents double slashes.
 */
function buildCanonicalUrl(...pathSegments: string[]): string {
  const baseUrl = getBaseUrl();
  const path = pathSegments
    .join('/')
    .replace(/\/+/g, '/') // Replace multiple slashes with single slash
    .replace(/^\//, '') // Remove leading slash
    .replace(/\/$/, ''); // Remove trailing slash
  
  return `${baseUrl}/${path}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { provider, code } = await params;
  const errorCode = getErrorCode(provider as ErrorProvider, code);

  if (!errorCode) {
    return {
      title: 'Error Not Found',
      description: 'The requested error code could not be found.',
    };
  }

  // Use metaDescription if available, otherwise fallback to first 150 chars of description
  const description = errorCode.metaDescription || errorCode.description.slice(0, 150).trim();

  // Construct title in the format: "${code} - ${name} | ${provider.toUpperCase()} Error Reference"
  const title = `${errorCode.code} - ${errorCode.name} | ${(provider as string).toUpperCase()} Error Reference`;

  const canonicalUrl = buildCanonicalUrl('errors', provider, code);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Error Code Reference',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
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

export default async function ErrorCodePage({ params }: PageProps) {
  const { provider, code } = await params;
  const errorCode = getErrorCode(provider as ErrorProvider, code);

  if (!errorCode) {
    notFound();
  }

  const structuredData = generateStructuredData(
    errorCode,
    provider as ErrorProvider,
    code
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ErrorPage errorCode={errorCode} provider={provider} code={code} />
    </>
  );
}


