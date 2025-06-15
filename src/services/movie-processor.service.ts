import WordPressServiceSingleton from './wordpress.singleton';
import MovieEnrichmentService from './movie-enrichment.service';
import MoviePreFetchService from './movie-prefetch.service';
import type { MovieSelectionData, Movie } from '../types';

interface ProcessingProgress {
  current: number;
  total: number;
  currentMovie: string;
  status: 'processing' | 'error' | 'complete';
}

export class MovieProcessorService {
  private wordpressService: ReturnType<typeof WordPressServiceSingleton.getInstance>;
  private enrichmentService: MovieEnrichmentService;
  private preFetchService: MoviePreFetchService;

  constructor(preFetchService?: MoviePreFetchService) {
    this.wordpressService = WordPressServiceSingleton.getInstance();
    this.enrichmentService = new MovieEnrichmentService();
    this.preFetchService = preFetchService || new MoviePreFetchService();
  }

  /**
   * Process a list of selected movies from TMDb search results
   * Enriches data, uploads posters, and saves to WordPress
   */
  async processMovies(
    selectedMovies: MovieSelectionData[],
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<Movie[]> {
    const processedMovies: Movie[] = [];
    
    for (let i = 0; i < selectedMovies.length; i++) {
      const movieSelection = selectedMovies[i];
      
      try {
        // Report progress
        onProgress?.({
          current: i + 1,
          total: selectedMovies.length,
          currentMovie: movieSelection.title,
          status: 'processing'
        });

        // Check if movie already exists in WordPress by TMDb ID
        const existingMovie = await this.findExistingMovie(movieSelection.tmdbId);
        
        if (existingMovie) {
          console.log(`Movie "${movieSelection.title}" already exists in WordPress:`, existingMovie.id);
          processedMovies.push(existingMovie);
          continue;
        }

        // Check if we have pre-fetched enriched data for this movie
        const preFetchedData = this.preFetchService.getEnrichedData(movieSelection.tmdbId);
        
        let enrichedData;
        if (preFetchedData) {
          console.log(`Using pre-fetched data for "${movieSelection.title}"`);
          enrichedData = preFetchedData;
        } else {
          console.log(`Enriching "${movieSelection.title}" from scratch`);
          // Enrich movie data from TMDb with full relational dependencies
          enrichedData = await this.enrichmentService.enrichMovieData(
            {
              id: movieSelection.tmdbId,
              title: movieSelection.title,
              overview: movieSelection.overview,
              release_date: movieSelection.releaseDate,
              vote_average: movieSelection.voteAverage,
              poster_path: movieSelection.posterPath,
              backdrop_path: '',
              adult: false,
              genre_ids: [],
              original_language: '',
              original_title: movieSelection.title,
              popularity: 0,
              video: false,
              vote_count: 0
            },
            (progress) => {
              console.log(`Enriching ${movieSelection.title}: ${progress.step} (${progress.progress}/${progress.total})`);
            }
          );
        }
        
        // Create all WordPress entities with full relationships
        const { movieId } = await this.enrichmentService.createWordPressEntities(
          enrichedData,
          (progress) => {
            console.log(`Creating entities for ${movieSelection.title}: ${progress.step} (${progress.progress}/${progress.total})`);
          }
        );

        // Get the created movie from WordPress
        const savedMovie = await this.wordpressService.getMovieById(movieId);
        console.log(`Successfully enriched and saved movie "${savedMovie.title}" with all relationships:`, savedMovie.id);
        
        processedMovies.push(savedMovie);
        
      } catch (error) {
        console.error(`Failed to process movie "${movieSelection.title}":`, error);
        
        onProgress?.({
          current: i + 1,
          total: selectedMovies.length,
          currentMovie: movieSelection.title,
          status: 'error'
        });
        
        // Continue processing other movies instead of failing completely
        continue;
      }
    }

    onProgress?.({
      current: selectedMovies.length,
      total: selectedMovies.length,
      currentMovie: 'Complete',
      status: 'complete'
    });

    return processedMovies;
  }

  /**
   * Check if a movie already exists in WordPress by TMDb ID
   */
  private async findExistingMovie(tmdbId: number): Promise<Movie | null> {
    try {
      // TODO: Implement search by TMDb ID in WordPress service
      // For now, we'll assume movies don't exist and always create new ones
      // This can be optimized later by using:
      // const results = await this.wordpressService.searchPostsByMeta('movie', 'movie_tmdb_id', tmdbId);
      // return results.length > 0 ? await this.wordpressService.getMovieById(results[0].id) : null;
      console.log(`Checking for existing movie with TMDb ID: ${tmdbId}`);
      return null;
    } catch (error) {
      console.warn('Error checking for existing movie:', error);
      return null;
    }
  }
}

export default MovieProcessorService;
