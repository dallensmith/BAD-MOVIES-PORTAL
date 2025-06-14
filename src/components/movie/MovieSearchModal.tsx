import { useState, useCallback, useEffect } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { Input, Button, Modal } from '../ui';
import { clsx } from 'clsx';
import TMDbService from '../../services/tmdb.service';
import { config } from '../../utils/config';
import type { TMDbMovie, MovieSelectionData } from '../../types';

interface MovieSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMovie: (movie: MovieSelectionData) => void;
  selectedMovies?: MovieSelectionData[];
}

// Initialize TMDb service
const tmdbService = new TMDbService(config.tmdb);

const MovieSearchModal: React.FC<MovieSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectMovie,
  selectedMovies = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDbMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    async (query: string) => {
      if (query.length < 2) {
        setSearchResults([]);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);

      try {
        const searchResponse = await tmdbService.searchMovies(query, 1);
        setSearchResults(searchResponse.results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearch]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setHasSearched(false);
    }
  }, [isOpen]);

  const handleSelectMovie = (movie: TMDbMovie) => {
    const movieData: MovieSelectionData = {
      tmdbId: movie.id,
      title: movie.title,
      releaseDate: movie.release_date,
      posterPath: movie.poster_path,
      overview: movie.overview,
      voteAverage: movie.vote_average,
    };

    onSelectMovie(movieData);
  };

  const isMovieSelected = (movieId: number) => {
    return selectedMovies.some(movie => movie.tmdbId === movieId);
  };

  const getImageUrl = (path: string) => {
    return tmdbService.getImageUrl(path, 'w300');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Search Movies"
      size="lg"
    >
      <div className="space-y-6">
        {/* Search Input */}
        <div className="relative">
          <Input
            placeholder="Search for movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            rightIcon={
              searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-secondary-400 hover:text-secondary-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )
            }
            autoFocus
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-secondary-600">Searching movies...</span>
          </div>
        )}

        {/* Search Results */}
        {!isLoading && searchResults.length > 0 && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-medium text-secondary-900">
              Search Results ({searchResults.length})
            </h3>
            <div className="grid gap-4">
              {searchResults.map((movie) => (
                <div
                  key={movie.id}
                  className={clsx(
                    'flex space-x-4 p-4 border rounded-lg transition-all duration-200 hover:shadow-md',
                    isMovieSelected(movie.id)
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-secondary-200 hover:border-secondary-300'
                  )}
                >
                  {/* Movie Poster */}
                  <div className="flex-shrink-0">
                    <img
                      src={getImageUrl(movie.poster_path)}
                      alt={movie.title}
                      className="w-16 h-24 object-cover rounded-md bg-secondary-100"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-poster.png';
                      }}
                    />
                  </div>

                  {/* Movie Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-medium text-secondary-900 truncate">
                      {movie.title}
                    </h4>
                    {movie.release_date && (
                      <p className="text-sm text-secondary-500">
                        {new Date(movie.release_date).getFullYear()}
                      </p>
                    )}
                    <p className="text-sm text-secondary-700 mt-2 line-clamp-2">
                      {movie.overview}
                    </p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-sm text-secondary-500">
                        ⭐ {movie.vote_average.toFixed(1)}
                      </span>
                      <span className="text-sm text-secondary-500">
                        {movie.vote_count} votes
                      </span>
                    </div>
                  </div>

                  {/* Add Button */}
                  <div className="flex-shrink-0 flex items-center">
                    <Button
                      onClick={() => handleSelectMovie(movie)}
                      disabled={isMovieSelected(movie.id)}
                      variant={isMovieSelected(movie.id) ? 'secondary' : 'primary'}
                      size="sm"
                    >
                      {isMovieSelected(movie.id) ? (
                        'Selected'
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && hasSearched && searchResults.length === 0 && searchQuery.length >= 2 && (
          <div className="text-center py-8">
            <p className="text-secondary-500">
              No movies found for "{searchQuery}"
            </p>
            <p className="text-sm text-secondary-400 mt-1">
              Try a different search term
            </p>
          </div>
        )}

        {/* Empty State */}
        {!hasSearched && searchQuery.length < 2 && (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">
              Start typing to search for movies
            </p>
            <p className="text-sm text-secondary-400 mt-1">
              Type at least 2 characters to begin searching
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MovieSearchModal;
