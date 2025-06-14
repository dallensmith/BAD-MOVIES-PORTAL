import type { AppConfig } from '../types';

// Environment-based configuration
const getConfig = (): AppConfig => {
  const isDevelopment = import.meta.env.MODE === 'development';
  
  // Start with environment variables as base
  let wordpressConfig = {
    baseUrl: import.meta.env.VITE_WORDPRESS_URL || 'http://localhost:8080',
    apiUrl: import.meta.env.VITE_WORDPRESS_API_URL || 'http://localhost:8080/wp-json/wp/v2',
    authEndpoint: '/jwt-auth/v1/token',
  };

  // Try to get WordPress config from localStorage
  try {
    const savedConfig = localStorage.getItem('wordpress_config');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      // Only override if saved config has complete URLs AND includes /wp/v2
      if (parsed.url && parsed.apiUrl && parsed.apiUrl.includes('/wp/v2')) {
        wordpressConfig = {
          baseUrl: parsed.url,
          apiUrl: parsed.apiUrl,
          authEndpoint: '/jwt-auth/v1/token',
        };
      } else {
        // Clear invalid config
        localStorage.removeItem('wordpress_config');
      }
    }
  } catch (error) {
    console.warn('Failed to parse WordPress config from localStorage:', error);
    localStorage.removeItem('wordpress_config');
  }
  
  return {
    tmdb: {
      apiKey: import.meta.env.VITE_TMDB_API_KEY || '',
      baseUrl: 'https://api.themoviedb.org/3',
      imageBaseUrl: 'https://image.tmdb.org/t/p',
    },
    wordpress: wordpressConfig,
    amazon: {
      affiliateId: import.meta.env.VITE_AMAZON_AFFILIATE_ID || '',
    },
    cache: {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 100,
      persistentStorage: true,
    },
    features: {
      enableImageOptimization: true,
      enableRealTimeSearch: true,
      enableProgressTracking: true,
      enableOfflineMode: isDevelopment ? false : true,
    },
  };
};

export const config = getConfig();

// Configuration validation
export const validateConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!config.tmdb.apiKey) {
    errors.push('VITE_TMDB_API_KEY is required');
  }

  if (!config.wordpress.baseUrl) {
    errors.push('VITE_WORDPRESS_URL is required');
  }

  if (!config.wordpress.apiUrl) {
    errors.push('VITE_WORDPRESS_API_URL is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Export individual services configuration
export const tmdbConfig = config.tmdb;
export const wordpressConfig = config.wordpress;
export const cacheConfig = config.cache;
export const featuresConfig = config.features;
