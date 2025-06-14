import TMDbService from './tmdb.service';
import WordPressServiceSingleton from './wordpress.singleton';
import { config } from '../utils/config';
import type { MovieSelectionData, Movie, TMDbMovieDetails } from '../types';

interface ProcessingProgress {
  current: number;
  total: number;
  currentMovie: string;
  status: 'processing' | 'error' | 'complete';
}

export class MovieProcessorService {
  private tmdbService: TMDbService;
  private wordpressService: ReturnType<typeof WordPressServiceSingleton.getInstance>;

  constructor() {
    this.tmdbService = new TMDbService(config.tmdb);
    this.wordpressService = WordPressServiceSingleton.getInstance();
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

        // Enrich movie data from TMDb
        const enrichedMovie = await this.enrichMovieData(movieSelection);
        
        // Save movie to WordPress
        const savedMovie = await this.wordpressService.saveMovie(enrichedMovie);
        console.log(`Successfully saved movie "${savedMovie.title}" to WordPress:`, savedMovie.id);
        
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
  private async findExistingMovie(_tmdbId: number): Promise<Movie | null> {
    try {
      // TODO: Implement search by TMDb ID in WordPress service
      // For now, we'll assume movies don't exist and always create new ones
      // This can be optimized later
      return null;
    } catch (error) {
      console.warn('Error checking for existing movie:', error);
      return null;
    }
  }

  /**
   * Enrich basic movie selection data with full TMDb details
   */
  private async enrichMovieData(movieSelection: MovieSelectionData): Promise<Partial<Movie>> {
    try {
      // Get full movie details from TMDb
      const movieDetails = await this.tmdbService.getMovieDetails(movieSelection.tmdbId);
      
      // TODO: Get credits (cast and crew) when TMDb service supports it
      // const credits = await this.tmdbService.getMovieCredits(movieSelection.tmdbId);
      
      // Upload poster image to WordPress if available
      let posterPath: string | undefined;
      if (movieSelection.posterPath) {
        posterPath = await this.uploadMoviePoster(movieDetails, movieSelection.posterPath);
      }

      // Convert to our Movie format
      const enrichedMovie: Partial<Movie> = {
        tmdbId: movieDetails.id,
        imdbId: movieDetails.imdb_id,
        title: movieDetails.title,
        originalTitle: movieDetails.original_title,
        overview: movieDetails.overview,
        releaseDate: movieDetails.release_date,
        runtime: movieDetails.runtime,
        budget: movieDetails.budget,
        revenue: movieDetails.revenue,
        voteAverage: movieDetails.vote_average,
        voteCount: movieDetails.vote_count,
        popularity: movieDetails.popularity,
        originalLanguage: movieDetails.original_language,
        adult: movieDetails.adult,
        video: movieDetails.video,
        tagline: movieDetails.tagline,
        posterPath: posterPath || movieSelection.posterPath,
        backdropPath: movieDetails.backdrop_path,
        // TODO: Process cast, crew, genres, etc.
        // For now, we'll save basic movie data
      };

      return enrichedMovie;
      
    } catch (error) {
      console.error('Failed to enrich movie data:', error);
      
      // Fallback to basic data from selection
      return {
        tmdbId: movieSelection.tmdbId,
        title: movieSelection.title,
        overview: movieSelection.overview,
        releaseDate: movieSelection.releaseDate,
        voteAverage: movieSelection.voteAverage,
        posterPath: movieSelection.posterPath,
      };
    }
  }

  /**
   * Upload movie poster from TMDb to WordPress
   */
  private async uploadMoviePoster(movieDetails: TMDbMovieDetails, posterPath: string): Promise<string> {
    try {
      // Get the full resolution poster URL
      const posterUrl = this.tmdbService.getImageUrl(posterPath, 'w500');
      
      // Generate filename
      const filename = `${movieDetails.id}-poster.jpg`;
      
      // Download and upload to WordPress
      const uploadResult = await this.wordpressService.uploadImageFromUrl(posterUrl, filename);
      
      return uploadResult.originalUrl;
      
    } catch (error) {
      console.warn('Failed to upload movie poster:', error);
      // Return the original TMDb URL as fallback
      return this.tmdbService.getImageUrl(posterPath, 'w500');
    }
  }
}

export default MovieProcessorService;
