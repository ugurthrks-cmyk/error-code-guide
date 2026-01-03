import { MetadataRoute } from 'next';
import { getAllErrorCodes } from '@/lib/errors';

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

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/errors`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // Category pages
    {
      url: `${baseUrl}/errors/http`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/errors/aws`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/errors/azure`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/errors/gcp`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    // Legal & Info pages
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Add error code pages
  // getAllErrorCodes() returns a flat array of all error codes from all providers (AWS, Azure, GCP, HTTP)
  const errorCodes = getAllErrorCodes();
  
  // Iterate through all error codes and add them to the sitemap
  // TypeScript safety: errorCodes is already typed as ErrorCode[] from getAllErrorCodes()
  for (const error of errorCodes) {
    // Safety check: ensure error has required properties
    if (error && typeof error === 'object' && 'provider' in error && 'code' in error) {
      routes.push({
        url: `${baseUrl}/errors/${error.provider}/${error.code}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
  }

  return routes;
}


