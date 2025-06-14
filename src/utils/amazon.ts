import { config } from './config';

/**
 * Amazon affiliate link utilities
 */

/**
 * Generate an Amazon affiliate link for a movie
 * @param movie - The movie object
 * @param searchTerm - Optional search term override
 * @returns Amazon Video affiliate URL
 */
export const generateAmazonAffiliateLink = (
  movie: { title: string; releaseDate: string },
  searchTerm?: string
): string => {
  const affiliateId = config.amazon.affiliateId;
  if (!affiliateId) {
    console.warn('Amazon affiliate ID not configured');
    return '';
  }

  // Use custom search term or movie title + year
  const term = searchTerm || `${movie.title} ${new Date(movie.releaseDate).getFullYear()}`;
  // Replace spaces with + for Amazon Video search format
  const encodedTerm = term.replace(/\s+/g, '+').toLowerCase();
  
  return `https://www.amazon.com/gp/video/search?phrase=${encodedTerm}&tag=${affiliateId}`;
};

/**
 * Validate an Amazon URL and add affiliate ID if missing
 * @param url - The Amazon URL to validate/modify
 * @returns Amazon URL with affiliate tag
 */
export const validateAndAddAffiliateTag = (url: string): string => {
  const affiliateId = config.amazon.affiliateId;
  if (!affiliateId || !url) return url;

  try {
    const urlObj = new URL(url);
    
    // Only process Amazon URLs
    if (!urlObj.hostname.includes('amazon.')) {
      return url;
    }

    // Check if affiliate tag already exists
    if (urlObj.searchParams.has('tag')) {
      // Update existing tag to our affiliate ID
      urlObj.searchParams.set('tag', affiliateId);
    } else {
      // Add affiliate tag
      urlObj.searchParams.set('tag', affiliateId);
      
      // Only add additional tracking parameters for non-video URLs
      if (!urlObj.pathname.includes('/gp/video/')) {
        urlObj.searchParams.set('linkCode', 'ur2');
        urlObj.searchParams.set('camp', '1789');
        urlObj.searchParams.set('creative', '9325');
      }
    }

    return urlObj.toString();
  } catch (err) {
    console.warn('Invalid Amazon URL:', url, err);
    return url;
  }
};

/**
 * Extract product ID from Amazon URL
 * @param url - Amazon URL
 * @returns Product ID or null
 */
export const extractAmazonProductId = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes('amazon.')) return null;

    // Try to extract ASIN from various Amazon URL patterns
    const pathMatch = urlObj.pathname.match(/\/dp\/([A-Z0-9]{10})/i) || 
                     urlObj.pathname.match(/\/gp\/product\/([A-Z0-9]{10})/i);
    
    return pathMatch ? pathMatch[1] : null;
  } catch {
    return null;
  }
};

/**
 * Check if a URL is an Amazon URL
 * @param url - URL to check
 * @returns true if Amazon URL
 */
export const isAmazonUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('amazon.');
  } catch {
    return false;
  }
};
