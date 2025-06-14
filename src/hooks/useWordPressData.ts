import { useState, useEffect, useCallback, useRef } from 'react';
import WordPressServiceSingleton from '../services/wordpress.singleton';
import type { Experiment } from '../types';

// Initialize WordPress service
const wordpressService = WordPressServiceSingleton.getInstance();

export const useWordPressData = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentPageRef = useRef(1);
  const [hasMore, setHasMore] = useState(false);

  // Stats derived from experiments
  const stats = {
    totalExperiments: experiments.length,
    experimentsThisMonth: experiments.filter(exp => {
      const expDate = new Date(exp.date);
      const now = new Date();
      return expDate.getMonth() === now.getMonth() && 
             expDate.getFullYear() === now.getFullYear();
    }).length,
    totalMovies: experiments.reduce((total, exp) => total + exp.movies.length, 0),
    totalPeople: 0, // Will be calculated when we have cast/crew data
  };

  const fetchExperiments = useCallback(async (reset: boolean = true) => {
    try {
      if (reset) {
        setIsLoading(true);
        currentPageRef.current = 1;
      } else {
        setIsLoadingMore(true);
      }
      setError(null);
      
      // Use current page for calculation, but don't depend on it in useCallback
      const pageToFetch = reset ? 1 : (currentPageRef.current + 1);
      const perPage = 5; // Load 5 experiments at a time
      
      // Try to fetch from WordPress
      const response = await wordpressService.getExperiments(pageToFetch, perPage);
      
      if (reset) {
        setExperiments(response.experiments);
      } else {
        setExperiments(prev => [...prev, ...response.experiments]);
      }
      
      currentPageRef.current = pageToFetch;
      setHasMore(pageToFetch < response.totalPages);
      
    } catch (err) {
      console.error('Failed to fetch experiments from WordPress:', err);
      setError(`Failed to load experiments from WordPress: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Fall back to mock data if WordPress is not available (only on first load)
      if (reset) {
        const mockExperiments: Experiment[] = [
        {
          id: 1,
          number: 12,
          title: 'Experiment #012',
          date: '2025-06-10',
          hostId: 1,
          host: {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            displayName: 'Administrator',
            firstName: 'Admin',
            lastName: 'User',
            avatar: '',
            roles: ['administrator'],
            capabilities: [],
            registeredDate: '',
            lastLogin: ''
          },
          platforms: [
            { id: 1, name: 'Bigscreen VR', description: '', url: '', icon: '', color: '', isDefault: true, wordpressId: 1, slug: 'bigscreen-vr', createdAt: '', updatedAt: '' },
            { id: 2, name: 'Discord', description: '', url: '', icon: '', color: '', isDefault: true, wordpressId: 2, slug: 'discord', createdAt: '', updatedAt: '' }
          ],
          movies: [
            {
              id: 1,
              tmdbId: 19995,
              title: 'The Room',
              originalTitle: 'The Room',
              overview: 'A successful banker, Johnny, lives happily in a San Francisco townhouse with his fiancée, Lisa.',
              releaseDate: '2003-06-27',
              runtime: 99,
              budget: 6000000,
              revenue: 0,
              popularity: 25.384,
              voteAverage: 3.7,
              voteCount: 2847,
              tagline: 'A film with the passion of Tennessee Williams.',
              status: 'Released',
              posterPath: '/3kcELXODepTnCcXDrUp2ikhqX7l.jpg',
              backdropPath: '/dDMa8rh9ZCWy8BNVxKX8n2BRX2Y.jpg',
              imdbId: 'tt0368226',
              originalLanguage: 'en',
              adult: false,
              video: false,
              genres: [],
              cast: [],
              crew: [],
              studios: [],
              countries: [],
              languages: [],
              keywords: [],
              createdAt: '2025-06-14T00:00:00Z',
              updatedAt: '2025-06-14T00:00:00Z'
            }
          ],
          status: 'Completed',
          createdAt: '2025-06-10T00:00:00Z',
          updatedAt: '2025-06-10T00:00:00Z'
        }
      ];
      setExperiments(mockExperiments);
      currentPageRef.current = 1;
      setHasMore(false);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []); // Empty dependency array to prevent recreation

  const loadMoreExperiments = async () => {
    if (!hasMore || isLoadingMore) return;
    await fetchExperiments(false);
  };

  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);

  return {
    experiments,
    stats,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    refetch: () => fetchExperiments(true),
    loadMore: loadMoreExperiments,
  };
};
