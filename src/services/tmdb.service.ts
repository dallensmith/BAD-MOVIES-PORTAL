import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { 
  TMDbMovieSearchResult, 
  TMDbMovieDetails, 
  TMDbPersonDetails,
  AppConfig 
} from '../types';

class TMDbService {
  private api: AxiosInstance;
  private config: AppConfig['tmdb'];

  constructor(config: AppConfig['tmdb']) {
    this.config = config;
    this.api = axios.create({
      baseURL: config.baseUrl,
      params: {
        api_key: config.apiKey,
      },
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('TMDb API Error:', error.response?.data || error.message);
        throw new Error(
          error.response?.data?.status_message || 
          'Failed to fetch data from TMDb'
        );
      }
    );
  }

  /**
   * Search for movies by title with debouncing support
   */
  async searchMovies(
    query: string, 
    page: number = 1,
    includeAdult: boolean = false
  ): Promise<TMDbMovieSearchResult> {
    const response: AxiosResponse<TMDbMovieSearchResult> = await this.api.get('/search/movie', {
      params: {
        query: query.trim(),
        page,
        include_adult: includeAdult,
        language: 'en-US',
      },
    });

    return response.data;
  }

  /**
   * Get complete movie details including cast, crew, and metadata
   */
  async getMovieDetails(movieId: number): Promise<TMDbMovieDetails> {
    const response: AxiosResponse<TMDbMovieDetails> = await this.api.get(
      `/movie/${movieId}`,
      {
        params: {
          append_to_response: 'credits,keywords,images,videos,recommendations',
          language: 'en-US',
        },
      }
    );

    return response.data;
  }

  /**
   * Get person details (actor, director, etc.)
   */
  async getPersonDetails(personId: number): Promise<TMDbPersonDetails> {
    const response: AxiosResponse<TMDbPersonDetails> = await this.api.get(
      `/person/${personId}`,
      {
        params: {
          language: 'en-US',
        },
      }
    );

    return response.data;
  }

  /**
   * Get configuration including image base URLs
   */
  async getConfiguration() {
    const response = await this.api.get('/configuration');
    return response.data;
  }

  /**
   * Get list of official genres
   */
  async getGenres() {
    const response = await this.api.get('/genre/movie/list', {
      params: {
        language: 'en-US',
      },
    });
    return response.data.genres;
  }

  /**
   * Get trending movies
   */
  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week', page: number = 1) {
    const response = await this.api.get(`/trending/movie/${timeWindow}`, {
      params: {
        page,
        language: 'en-US',
      },
    });
    return response.data;
  }

  /**
   * Get popular movies
   */
  async getPopularMovies(page: number = 1) {
    const response = await this.api.get('/movie/popular', {
      params: {
        page,
        language: 'en-US',
      },
    });
    return response.data;
  }

  /**
   * Build complete image URL from path
   */
  getImageUrl(path: string, size: string = 'w500'): string {
    if (!path) return '';
    return `${this.config.imageBaseUrl}/${size}${path}`;
  }

  /**
   * Get multiple image sizes for responsive loading
   */
  getImageSizes(path: string) {
    if (!path) return { thumbnail: '', standard: '', highRes: '' };
    
    return {
      thumbnail: this.getImageUrl(path, 'w300'),
      standard: this.getImageUrl(path, 'w500'), 
      highRes: this.getImageUrl(path, 'w780'),
      original: this.getImageUrl(path, 'original'),
    };
  }

  /**
   * Search with auto-complete suggestions
   */
  async getSearchSuggestions(query: string, limit: number = 5) {
    if (query.length < 2) return [];
    
    const results = await this.searchMovies(query, 1);
    return results.results.slice(0, limit).map(movie => ({
      id: movie.id,
      title: movie.title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      poster: this.getImageUrl(movie.poster_path, 'w92'),
    }));
  }

  /**
   * Batch fetch movie details for multiple movies
   */
  async batchGetMovieDetails(movieIds: number[]): Promise<TMDbMovieDetails[]> {
    const promises = movieIds.map(id => this.getMovieDetails(id));
    return Promise.all(promises);
  }

  /**
   * Get similar movies for recommendation
   */
  async getSimilarMovies(movieId: number, page: number = 1) {
    const response = await this.api.get(`/movie/${movieId}/similar`, {
      params: {
        page,
        language: 'en-US',
      },
    });
    return response.data;
  }

  /**
   * Get movie videos (trailers, teasers, etc.)
   */
  async getMovieVideos(movieId: number) {
    const response = await this.api.get(`/movie/${movieId}/videos`, {
      params: {
        language: 'en-US',
      },
    });
    return response.data.results;
  }
}

export default TMDbService;
