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
  
  // Filter states
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [yearFilter, setYearFilter] = useState<string>('');
  const [decadeFilter, setDecadeFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popularity.desc');
  const [includeAdult, setIncludeAdult] = useState<boolean>(true); // Default to true as requested
  const [genres, setGenres] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);

  // Load genres on component mount
  useEffect(() => {
    const loadGenres = async () => {
      if (!isOpen) return; // Don't load if modal is not open
      
      setIsLoadingGenres(true);
      try {
        const genresResponse = await tmdbService.getGenres();
        if (genresResponse && Array.isArray(genresResponse)) {
          setGenres(genresResponse);
        } else {
          console.warn('Invalid genres response:', genresResponse);
          setGenres([]); // Set empty array as fallback
        }
      } catch (error) {
        console.error('Failed to load genres:', error);
        setGenres([]); // Set empty array as fallback
      } finally {
        setIsLoadingGenres(false);
      }
    };

    if (isOpen) {
      loadGenres();
    }
  }, [isOpen]);

  // Enhanced search function with filters
  const debouncedSearch = useCallback(
    async (query: string, useFilters: boolean = false) => {
      if (query.length < 2 && !useFilters) {
        setSearchResults([]);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);

      try {
        let searchResponse;
        
        if (query.length >= 2) {
          // Use search endpoint when there's a query
          if (yearFilter && !decadeFilter && selectedGenres.length === 0) {
            // Use simple year search for specific years with no other filters
            const year = parseInt(yearFilter);
            searchResponse = await tmdbService.searchMoviesAdvanced(query, {
              page: 1,
              includeAdult: includeAdult,
              primaryReleaseYear: year,
            });
          } else if (decadeFilter || selectedGenres.length > 0) {
            // For decade filtering or genre filtering with search, we need a hybrid approach
            if ((decadeFilter && selectedGenres.length === 0) || (selectedGenres.length > 0 && !decadeFilter)) {
              // For single filter type + search, use search first then filter client-side
              searchResponse = await tmdbService.searchMovies(query, 1, includeAdult);
              
              if (decadeFilter) {
                // Filter results by decade client-side
                const decade = parseInt(decadeFilter);
                const startYear = decade;
                const endYear = decade + 9;
                
                searchResponse.results = searchResponse.results.filter(movie => {
                  if (!movie.release_date) return false;
                  const movieYear = new Date(movie.release_date).getFullYear();
                  return movieYear >= startYear && movieYear <= endYear;
                });
              }
              
              if (selectedGenres.length > 0) {
                // Filter results by genre client-side
                searchResponse.results = searchResponse.results.filter(movie => {
                  if (!movie.genre_ids || movie.genre_ids.length === 0) return false;
                  // Check if movie has any of the selected genres
                  return selectedGenres.some(genreId => movie.genre_ids.includes(genreId));
                });
              }
            } else {
              // For multiple filter types with search, use discover + title filtering
              const discoverOptions: {
                page?: number;
                includeAdult?: boolean;
                primaryReleaseYear?: number;
                primaryReleaseDateGte?: string;
                primaryReleaseDateLte?: string;
                withGenres?: string;
                sortBy?: 'popularity.desc' | 'popularity.asc' | 'release_date.desc' | 'release_date.asc' | 'vote_average.desc' | 'vote_average.asc';
                voteCountGte?: number;
              } = {
                page: 1,
                includeAdult: includeAdult,
                sortBy: sortBy as 'popularity.desc' | 'popularity.asc' | 'release_date.desc' | 'release_date.asc' | 'vote_average.desc' | 'vote_average.asc',
              };

              // Apply year/decade filter
              if (decadeFilter) {
                const decade = parseInt(decadeFilter);
                discoverOptions.primaryReleaseDateGte = `${decade}-01-01`;
                discoverOptions.primaryReleaseDateLte = `${decade + 9}-12-31`;
                // Also add vote count to ensure we get movies with some popularity
                discoverOptions.voteCountGte = 10;
              }

              // Apply genre filter
              if (selectedGenres.length > 0) {
                discoverOptions.withGenres = selectedGenres.join(',');
              }

              searchResponse = await tmdbService.discoverMovies(discoverOptions);
              
              // Filter results by title match if we have a search query
              if (query.trim()) {
                const queryLower = query.toLowerCase();
                searchResponse.results = searchResponse.results.filter(movie => 
                  movie.title.toLowerCase().includes(queryLower) ||
                  (movie.original_title && movie.original_title.toLowerCase().includes(queryLower))
                );
              }
            }
          } else {
            // Basic search with no filters
            searchResponse = await tmdbService.searchMovies(query, 1, includeAdult);
          }
        } else if (useFilters) {
          // Use discover endpoint when only filters are applied
          const discoverOptions: {
            page?: number;
            includeAdult?: boolean;
            primaryReleaseYear?: number;
            primaryReleaseDateGte?: string;
            primaryReleaseDateLte?: string;
            withGenres?: string;
            sortBy?: 'popularity.desc' | 'popularity.asc' | 'release_date.desc' | 'release_date.asc' | 'vote_average.desc' | 'vote_average.asc';
            voteCountGte?: number;
          } = {
            page: 1,
            includeAdult: includeAdult, // Use the state value
            sortBy: sortBy as 'popularity.desc' | 'popularity.asc' | 'release_date.desc' | 'release_date.asc' | 'vote_average.desc' | 'vote_average.asc',
          };

          // Apply year/decade filter
          if (yearFilter) {
            discoverOptions.primaryReleaseYear = parseInt(yearFilter);
          } else if (decadeFilter) {
            const decade = parseInt(decadeFilter);
            discoverOptions.primaryReleaseDateGte = `${decade}-01-01`;
            discoverOptions.primaryReleaseDateLte = `${decade + 9}-12-31`;
            // Add vote count to ensure we get movies with some popularity
            discoverOptions.voteCountGte = 10;
            console.log('Decade filter debug (filters only):', { 
              decadeFilter, 
              decade, 
              gte: discoverOptions.primaryReleaseDateGte, 
              lte: discoverOptions.primaryReleaseDateLte,
              voteCountGte: discoverOptions.voteCountGte
            });
          }

          // Apply genre filter
          if (selectedGenres.length > 0) {
            discoverOptions.withGenres = selectedGenres.join(',');
          }

          searchResponse = await tmdbService.discoverMovies(discoverOptions);
        } else {
          setSearchResults([]);
          return;
        }

        setSearchResults(searchResponse.results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [yearFilter, decadeFilter, selectedGenres, sortBy, includeAdult]
  );

  // Debounce search input and filters
  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearch]);

  // Trigger search when filters change
  useEffect(() => {
    if (hasSearched) {
      debouncedSearch(searchQuery, true);
    }
  }, [yearFilter, decadeFilter, selectedGenres, sortBy, includeAdult, hasSearched, searchQuery, debouncedSearch]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setHasSearched(false);
      setSelectedGenres([]);
      setYearFilter('');
      setDecadeFilter('');
      setSortBy('popularity.desc');
      setIncludeAdult(true); // Reset to default (on)
      // Don't reset genres here - keep them loaded for better UX
    }
  }, [isOpen]);

  // Filter handlers
  const handleGenreToggle = (genreId: number) => {
    setSelectedGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleDecadeChange = (decade: string) => {
    setDecadeFilter(decade);
    setYearFilter(''); // Clear specific year when decade is selected
  };

  const handleYearChange = (year: string) => {
    setYearFilter(year);
    setDecadeFilter(''); // Clear decade when specific year is selected
  };

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
      size="xl"
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

        {/* Filter Options */}
        <div className="bg-secondary-50 p-4 rounded-lg space-y-4">
          <h4 className="text-sm font-medium text-secondary-700">Filter Options</h4>
          
          {/* Year/Decade, Sort, and Adult Content Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Decade Filter */}
            <div>
              <label className="block text-xs font-medium text-secondary-600 mb-1">Decade</label>
              <select
                value={decadeFilter}
                onChange={(e) => handleDecadeChange(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-secondary-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Any Decade</option>
                <option value="2020">2020s</option>
                <option value="2010">2010s</option>
                <option value="2000">2000s</option>
                <option value="1990">1990s</option>
                <option value="1980">1980s</option>
                <option value="1970">1970s</option>
                <option value="1960">1960s</option>
                <option value="1950">1950s</option>
                <option value="1940">1940s</option>
                <option value="1930">1930s</option>
              </select>
            </div>

            {/* Specific Year Filter */}
            <div>
              <label className="block text-xs font-medium text-secondary-600 mb-1">Specific Year</label>
              <input
                type="number"
                min="1900"
                max="2030"
                value={yearFilter}
                onChange={(e) => handleYearChange(e.target.value)}
                placeholder="e.g. 1987"
                className="w-full px-2 py-1 text-sm border border-secondary-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs font-medium text-secondary-600 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-secondary-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="popularity.desc">Most Popular</option>
                <option value="popularity.asc">Least Popular</option>
                <option value="vote_average.desc">Highest Rated</option>
                <option value="vote_average.asc">Lowest Rated</option>
                <option value="release_date.desc">Newest First</option>
                <option value="release_date.asc">Oldest First</option>
              </select>
            </div>

            {/* Adult Content Toggle */}
            <div>
              <label className="block text-xs font-medium text-secondary-600 mb-1">Content</label>
              <div className="flex items-center h-8">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAdult}
                    onChange={(e) => setIncludeAdult(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={clsx(
                    'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                    includeAdult ? 'bg-primary-600' : 'bg-secondary-200'
                  )}>
                    <span className={clsx(
                      'inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      includeAdult ? 'translate-x-4' : 'translate-x-0'
                    )} />
                  </div>
                  <span className="ml-2 text-xs text-secondary-700">
                    Include Adult
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Genres Filter */}
          <div>
            <label className="block text-xs font-medium text-secondary-600 mb-2">Genres</label>
            {isLoadingGenres ? (
              <div className="text-xs text-secondary-500">Loading genres...</div>
            ) : genres && genres.length > 0 ? (
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => handleGenreToggle(genre.id)}
                    className={clsx(
                      'px-2 py-1 text-xs rounded-full border transition-colors',
                      selectedGenres.includes(genre.id)
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-secondary-600 border-secondary-300 hover:border-primary-300'
                    )}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-xs text-secondary-500">Unable to load genres. Try refreshing the modal.</div>
            )}
          </div>

          {/* Active Filters Indicator */}
          {(selectedGenres.length > 0 || yearFilter || decadeFilter || sortBy !== 'popularity.desc' || !includeAdult) && (
            <div className="text-xs text-primary-600">
              🔍 Filters active • {selectedGenres.length > 0 && `${selectedGenres.length} genres`}
              {yearFilter && ` • Year: ${yearFilter}`}
              {decadeFilter && ` • Decade: ${decadeFilter}s`}
              {sortBy !== 'popularity.desc' && ` • Sorted by ${sortBy.replace('.', ' ').replace('_', ' ')}`}
              {!includeAdult && ` • No adult content`}
            </div>
          )}
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
            <div className="space-y-3">
              {searchResults.map((movie) => (
                <div
                  key={movie.id}
                  className={clsx(
                    'flex space-x-3 p-3 border rounded-lg transition-all duration-200 hover:shadow-md',
                    isMovieSelected(movie.id)
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-secondary-200 hover:border-secondary-300'
                  )}
                >
                  {/* Movie Poster */}
                  <div className="flex-shrink-0">
                    {movie.poster_path ? (
                      <img
                        src={getImageUrl(movie.poster_path)}
                        alt={movie.title}
                        className="w-12 h-18 object-cover rounded-md bg-secondary-100"
                        onError={(e) => {
                          // Replace with placeholder if image fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    {/* Placeholder for missing poster */}
                    <div 
                      className={clsx(
                        'w-12 h-18 bg-secondary-200 rounded-md flex items-center justify-center text-secondary-500 text-xs',
                        movie.poster_path ? 'hidden' : 'flex'
                      )}
                    >
                      <div className="text-center">
                        🎬<br/>No<br/>Image
                      </div>
                    </div>
                  </div>

                  {/* Movie Details */}
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-base font-medium text-secondary-900 truncate">
                            {movie.title}
                          </h4>
                          {/* Adult Content Indicator */}
                          {movie.adult && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-600 text-white">
                              ADULT
                            </span>
                          )}
                        </div>
                        {movie.release_date && (
                          <p className="text-sm text-secondary-500">
                            {new Date(movie.release_date).getFullYear()}
                          </p>
                        )}
                      </div>
                      
                      {/* Add Button - moved to top right */}
                      <div className="flex-shrink-0 ml-3">
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
                              <Plus className="w-3 h-3 mr-1" />
                              Add
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-secondary-700 mt-1 line-clamp-2">
                      {movie.overview}
                    </p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-xs text-secondary-500">
                        ⭐ {movie.vote_average.toFixed(1)}
                      </span>
                      <span className="text-xs text-secondary-500">
                        {movie.vote_count} votes
                      </span>
                    </div>
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
