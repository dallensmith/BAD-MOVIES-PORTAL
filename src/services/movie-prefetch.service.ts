import { MovieEnrichmentService } from './movie-enrichment.service';
import type { TMDbMovie, MovieSelectionData, TMDbMovieDetails } from '../types';

// Define the enriched data structure to match what the enrichment service returns
interface EnrichedMovieData {
  movie: TMDbMovieDetails;
  actors: Array<{
    tmdb_id: number;
    name: string;
    character?: string;
    profile_path?: string;
    biography?: string;
    birthday?: string;
    deathday?: string;
    place_of_birth?: string;
    profile_image_url?: string;
  }>;
  directors: Array<{
    tmdb_id: number;
    name: string;
    profile_path?: string;
    biography?: string;
    birthday?: string;
    deathday?: string;
    place_of_birth?: string;
    profile_image_url?: string;
  }>;
  writers: Array<{
    tmdb_id: number;
    name: string;
    profile_path?: string;
    biography?: string;
    birthday?: string;
    deathday?: string;
    place_of_birth?: string;
    profile_image_url?: string;
  }>;
  genres: Array<{
    tmdb_id: number;
    name: string;
  }>;
  studios: Array<{
    tmdb_id: number;
    name: string;
    logo_path?: string;
    origin_country?: string;
  }>;
  countries: Array<{
    iso_3166_1: string;
    name: string;
  }>;
  languages: Array<{
    iso_639_1: string;
    name: string;
    english_name: string;
  }>;
  enrichmentProgress: {
    step: string;
    progress: number;
    total: number;
  };
}

interface PreFetchProgress {
  step: string;
  progress: number;
  total: number;
  currentMovie: string;
  status: 'fetching' | 'enriching' | 'complete' | 'error';
}

interface EnrichedMovieSelection extends MovieSelectionData {
  isEnriched: boolean;
  enrichmentData?: EnrichedMovieData;
  enrichmentError?: string;
}

export class MoviePreFetchService {
  private enrichmentService: MovieEnrichmentService;
  private enrichedMovies: Map<number, EnrichedMovieData> = new Map();

  constructor() {
    this.enrichmentService = new MovieEnrichmentService();
  }

  /**
   * Pre-fetch and enrich movie data when user selects a movie
   */
  async preFetchMovieData(
    movieSelection: MovieSelectionData,
    onProgress?: (progress: PreFetchProgress) => void
  ): Promise<EnrichedMovieSelection> {
    const movieId = movieSelection.tmdbId;
    
    // Check if already enriched
    if (this.enrichedMovies.has(movieId)) {
      return {
        ...movieSelection,
        isEnriched: true,
        enrichmentData: this.enrichedMovies.get(movieId)
      };
    }

    try {
      onProgress?.({
        step: `Pre-fetching data for "${movieSelection.title}"`,
        progress: 1,
        total: 2,
        currentMovie: movieSelection.title,
        status: 'fetching'
      });

      // Convert MovieSelectionData to TMDbMovie for enrichment service
      const tmdbMovie: TMDbMovie = {
        id: movieSelection.tmdbId,
        title: movieSelection.title,
        original_title: movieSelection.title,
        overview: movieSelection.overview || '',
        release_date: movieSelection.releaseDate || '',
        poster_path: movieSelection.posterPath || '',
        backdrop_path: '',
        vote_average: movieSelection.voteAverage || 0,
        vote_count: 0,
        popularity: 0,
        adult: false,
        video: false,
        original_language: '',
        genre_ids: []
      };

      onProgress?.({
        step: `Enriching data for "${movieSelection.title}"`,
        progress: 2,
        total: 2,
        currentMovie: movieSelection.title,
        status: 'enriching'
      });

      // Enrich the movie data
      const enrichedData = await this.enrichmentService.enrichMovieData(
        tmdbMovie,
        (enrichProgress) => {
          onProgress?.({
            step: `${enrichProgress.step} for "${movieSelection.title}"`,
            progress: enrichProgress.progress,
            total: enrichProgress.total,
            currentMovie: movieSelection.title,
            status: 'enriching'
          });
        }
      );

      // Cache the enriched data
      this.enrichedMovies.set(movieId, enrichedData);

      onProgress?.({
        step: `Pre-fetch complete for "${movieSelection.title}"`,
        progress: 2,
        total: 2,
        currentMovie: movieSelection.title,
        status: 'complete'
      });

      return {
        ...movieSelection,
        isEnriched: true,
        enrichmentData: enrichedData
      };

    } catch (error) {
      console.error(`Failed to pre-fetch movie "${movieSelection.title}":`, error);
      
      onProgress?.({
        step: `Pre-fetch failed for "${movieSelection.title}"`,
        progress: 2,
        total: 2,
        currentMovie: movieSelection.title,
        status: 'error'
      });

      return {
        ...movieSelection,
        isEnriched: false,
        enrichmentError: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get enriched data for a movie if it exists
   */
  getEnrichedData(movieId: number): EnrichedMovieData | null {
    return this.enrichedMovies.get(movieId) || null;
  }

  /**
   * Check if a movie has been pre-fetched
   */
  isMovieEnriched(movieId: number): boolean {
    return this.enrichedMovies.has(movieId);
  }

  /**
   * Clear enriched data (useful for memory management)
   */
  clearEnrichedData(): void {
    this.enrichedMovies.clear();
  }

  /**
   * Remove specific movie from cache
   */
  removeEnrichedMovie(movieId: number): void {
    this.enrichedMovies.delete(movieId);
  }

  /**
   * Get all enriched movie IDs
   */
  getEnrichedMovieIds(): number[] {
    return Array.from(this.enrichedMovies.keys());
  }
}

export default MoviePreFetchService;
