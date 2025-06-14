// Core domain types based on the specification
export interface Movie {
  id: number;
  tmdbId: number;
  title: string;
  originalTitle: string;
  overview: string;
  releaseDate: string;
  runtime: number;
  budget: number;
  revenue: number;
  popularity: number;
  voteAverage: number;
  voteCount: number;
  tagline: string;
  status?: 'Released' | 'Post Production' | 'In Production' | 'Planned' | 'Rumored' | 'Canceled';
  posterPath: string;
  backdropPath: string;
  imdbId: string;
  originalLanguage: string;
  adult: boolean;
  video: boolean;
  
  // Movie-specific fields from Pods
  contentRating?: string;
  trailerUrl?: string;
  
  // E-commerce integration
  amazonLink?: string;
  
  // Processed data
  processedImages?: ProcessedImage;
  
  // Relationships
  genres: Genre[];
  cast: CastMember[];
  crew: CrewMember[];
  studios: Studio[];
  countries: Country[];
  languages: Language[];
  keywords: Keyword[];
  
  // WordPress integration
  wordpressId?: number;
  slug?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface Experiment {
  id: number;
  number: number; // Sequential experiment number (001, 002, etc.)
  title: string;
  date: string;
  hostId: number;
  host: WordPressUser;
  platforms: EventPlatform[];
  notes?: string;
  posterImage?: string;
  experimentImageId?: number; // WordPress media attachment ID for experiment image
  status: 'Draft' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  
  // Movie relationships
  movies: Movie[];
  
  // WordPress integration
  wordpressId?: number;
  slug?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface CastMember {
  id: number;
  tmdbId: number;
  name: string;
  character: string;
  order: number;
  profilePath?: string;
  
  // Person details
  person: Person;
}

export interface CrewMember {
  id: number;
  tmdbId: number;
  name: string;
  job: string;
  department: string;
  profilePath?: string;
  
  // Person details  
  person: Person;
}

export interface Person {
  id: number;
  tmdbId: number;
  name: string;
  biography?: string;
  birthday?: string;
  deathday?: string;
  placeOfBirth?: string;
  profilePath?: string;
  popularity: number;
  adult: boolean;
  imdbId?: string;
  homepage?: string;
  knownForDepartment: string;
  
  // WordPress integration
  wordpressId?: number;
  slug?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface Genre {
  id: number;
  tmdbId: number;
  name: string;
  
  // WordPress integration
  wordpressId?: number;
  slug?: string;
}

export interface Studio {
  id: number;
  tmdbId: number;
  name: string;
  description?: string;
  headquarters?: string;
  logoPath?: string;
  parentCompany?: string;
  homepage?: string;
  
  // WordPress integration
  wordpressId?: number;
  slug?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface Country {
  id: number;
  iso31661: string; // Two-letter country code
  name: string;
  
  // WordPress integration
  wordpressId?: number;
  slug?: string;
}

export interface Language {
  id: number;
  iso6391: string; // Two-letter language code
  name: string;
  englishName: string;
  
  // WordPress integration
  wordpressId?: number;
  slug?: string;
}

export interface Keyword {
  id: number;
  tmdbId: number;
  name: string;
  
  // WordPress integration
  wordpressId?: number;
  slug?: string;
}

export interface EventPlatform {
  id: number;
  name: string;
  description?: string;
  url?: string;
  icon?: string;
  color?: string;
  isDefault: boolean;
  
  // WordPress integration
  wordpressId?: number;
  slug?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface WordPressUser {
  id: number;
  username: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  avatar: string;
  roles: string[];
  capabilities: string[];
  
  // WordPress REST API fields
  name?: string;           // display name from WP API
  slug?: string;           // user nicename/slug
  login?: string;          // user login name
  
  // Metadata
  registeredDate: string;
  lastLogin?: string;
}

export interface ProcessedImage {
  thumbnail: UploadedImage;
  standard: UploadedImage;
  highRes: UploadedImage;
  originalUrl: string;
}

export interface UploadedImage {
  id: number;
  url: string;
  filename: string;
  mimeType: string;
  filesize: number;
  width: number;
  height: number;
  alt?: string;
  title?: string;
}

// API Response types for TMDb
export interface TMDbMovieSearchResult {
  page: number;
  results: TMDbMovie[];
  total_pages: number;
  total_results: number;
}

export interface TMDbMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult: boolean;
  video: boolean;
  original_language: string;
  genre_ids: number[];
}

export interface TMDbMovieDetails extends TMDbMovie {
  runtime: number;
  budget: number;
  revenue: number;
  tagline: string;
  status: string;
  imdb_id: string;
  homepage: string;
  genres: TMDbGenre[];
  production_companies: TMDbStudio[];
  production_countries: TMDbCountry[];
  spoken_languages: TMDbLanguage[];
  keywords: {
    keywords: TMDbKeyword[];
  };
  credits: {
    cast: TMDbCastMember[];
    crew: TMDbCrewMember[];
  };
}

export interface TMDbGenre {
  id: number;
  name: string;
}

export interface TMDbStudio {
  id: number;
  name: string;
  description?: string;
  headquarters?: string;
  logo_path?: string;
  parent_company?: string;
  homepage?: string;
}

export interface TMDbCountry {
  iso_3166_1: string;
  name: string;
}

export interface TMDbLanguage {
  iso_639_1: string;
  name: string;
  english_name: string;
}

export interface TMDbKeyword {
  id: number;
  name: string;
}

export interface TMDbCastMember {
  id: number;
  name: string;
  character: string;
  order: number;
  profile_path?: string;
  cast_id: number;
  credit_id: string;
}

export interface TMDbCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path?: string;
  credit_id: string;
}

export interface TMDbPersonDetails {
  id: number;
  name: string;
  biography?: string;
  birthday?: string;
  deathday?: string;
  place_of_birth?: string;
  profile_path?: string;
  popularity: number;
  adult: boolean;
  imdb_id?: string;
  homepage?: string;
  known_for_department: string;
}

// UI State types
export interface SearchState {
  query: string;
  results: TMDbMovie[];
  isLoading: boolean;
  error?: string;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ProcessingState {
  isProcessing: boolean;
  currentStep: string;
  currentMovie?: string;
  progress: number;
  steps: ProcessingStep[];
  error?: string;
}

export interface ProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  message?: string;
  progress?: number;
}

// Form types
export interface ExperimentFormData {
  title: string;
  experimentNumber: string; // e.g., "001", "002", "003"
  slug: string; // e.g., "experiment-001", "experiment-002"
  date: string;
  hostId: number;
  platformIds: number[];
  notes?: string;
  posterImage?: File;
  movieIds: number[]; // TMDb IDs for backward compatibility
  movieSelections?: MovieSelectionData[]; // Full movie selection data from TMDb search
}

export interface MovieSelectionData {
  tmdbId: number;
  title: string;
  releaseDate: string;
  posterPath: string;
  overview: string;
  voteAverage: number;
}

// Cache types
export interface CachedItem<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  persistentStorage: boolean;
}

// Error types
export interface APIError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Authentication types
export interface AuthState {
  isAuthenticated: boolean;
  user?: WordPressUser;
  token?: string;
  permissions: string[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface JWTToken {
  token: string;
  user_id: number;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
  exp: number;
  iat: number;
}

// Configuration types
export interface AppConfig {
  tmdb: {
    apiKey: string;
    baseUrl: string;
    imageBaseUrl: string;
  };
  wordpress: {
    baseUrl: string;
    apiUrl: string;
    authEndpoint: string;
  };
  amazon: {
    affiliateId: string;
  };
  cache: CacheConfig;
  features: {
    enableImageOptimization: boolean;
    enableRealTimeSearch: boolean;
    enableProgressTracking: boolean;
    enableOfflineMode: boolean;
  };
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type SortDirection = 'asc' | 'desc';

export type FilterOption = {
  key: string;
  label: string;
  value: string | number | boolean;
};

export type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

// WordPress-specific types for Pods plugin integration
export interface WordPressPodsUser {
  ID: string;
  user_login: string;
  user_nicename: string;
  display_name: string;
  user_email: string;
  user_url: string;
  user_registered: string;
  id: number;
}

export interface WordPressPodsActor {
  id: number;
  title: { rendered: string };
  actor_name: string;
  profile_image: string | false;
  actor_biography: string;
  actor_birthday: string;
  actor_deathday: string;
  actor_place_of_birth: string;
  actor_movie_count: string;
  actor_popularity: string;
  actor_known_for_department: string;
  actor_imdb_id: string;
  actor_imdb_url: string;
  actor_tmdb_url: string;
  actor_instagram_id: string;
  actor_twitter_id_: string;
  actor_facebook_id: string;
  related_movies_actor: unknown[];
}

export interface WordPressPodsMovie {
  id: number;
  title: { rendered: string };
  movie_title: string;
  movie_original_title: string;
  movie_year: string;
  movie_release_date: string;
  movie_runtime: string;
  movie_tagline: string;
  movie_overview: string;
  movie_content_rating: string;
  movie_budget: string;
  movie_box_office: string;
  movie_poster: string | { source_url?: string; url?: string; guid?: string } | unknown;
  movie_backdrop: string;
  movie_trailer: string;
  movie_tmdb_id: string;
  movie_tmdb_url: string;
  movie_tmdb_rating: string;
  movie_tmdb_votes: string;
  movie_imdb_id: string;
  movie_imdb_url: string;
  movie_amazon_link: string;
  movie_genres: number[];
  movie_studios: number[];
  movie_actors: number[];
  movie_directors: number[];
  movie_writers: number[];
  movie_characters: string[];
  movie_countries: number[];
  movie_languages: number[];
  movie_experiment: number[];
  
  // WordPress embedded data (for media URLs)
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      id: number;
      source_url: string;
      media_details?: {
        sizes?: Record<string, {
          source_url: string;
          width: number;
          height: number;
        }>;
      };
    }>;
  };
}

export interface WordPressPodsExperiment {
  id: number;
  title: { rendered: string };
  experiment_number: string;
  event_date: string;
  event_location: string[];
  event_host: WordPressPodsUser[];
  experiment_image: string | number | false; // Can be URL, media ID, or false
  experiment_notes: string;
  experiment_movies: WordPressPodsMovie[];
}
