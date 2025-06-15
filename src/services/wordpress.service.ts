import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  Experiment,
  Movie,
  Person,
  EventPlatform,
  WordPressUser,
  ProcessedImage,
  AppConfig,
  AuthState,
  LoginCredentials,
  WordPressPodsExperiment,
  WordPressPodsMovie
} from '../types';

class WordPressService {
  private api: AxiosInstance;
  private config: AppConfig['wordpress'];
  private authToken?: string;
  private useBasicAuth: boolean = false;

  constructor(config: AppConfig['wordpress']) {
    this.config = config;
    this.api = axios.create({
      baseURL: config.apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use((config) => {
      if (this.authToken) {
        if (this.useBasicAuth) {
          config.headers.Authorization = `Basic ${this.authToken}`;
        } else {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
      }
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearAuth();
        }
        console.error('WordPress API Error:', error.response?.data || error.message);
        throw new Error(
          error.response?.data?.message || 
          'Failed to communicate with WordPress'
        );
      }
    );

    // Initialize authentication
    this.initializeAuth();
  }

  /**
   * Initialize authentication on service creation
   */
  private async initializeAuth(): Promise<void> {
    console.log('Initializing WordPress authentication...');
    
    // Try to restore authentication from localStorage
    const restored = this.restoreAuth();
    console.log('Auth restored from localStorage:', restored);
    
    if (!restored) {
      // If no valid auth, try to auto-authenticate with environment credentials
      const autoAuthResult = await this.tryAutoAuth();
      console.log('Auto-authentication result:', autoAuthResult);
    } else {
      // Validate the restored token
      const isValid = await this.validateToken();
      console.log('Restored token validation:', isValid);
      if (!isValid) {
        // Token is invalid, try auto-auth
        const autoAuthResult = await this.tryAutoAuth();
        console.log('Auto-authentication after invalid token:', autoAuthResult);
      }
    }
  }

  /**
   * Try to authenticate automatically using environment credentials
   */
  private async tryAutoAuth(): Promise<boolean> {
    const username = import.meta.env.VITE_WP_USERNAME;
    const password = import.meta.env.VITE_WP_PASSWORD;

    if (username && password) {
      try {
        console.log('Attempting auto-authentication...');
        
        // First try JWT authentication
        try {
          await this.login({ username, password });
          console.log('Auto-authentication successful with JWT');
          return true;
        } catch {
          console.log('JWT authentication failed, trying Basic Auth...');
          
          // If JWT fails, try basic auth
          const success = await this.loginWithBasicAuth({ username, password });
          if (success) {
            console.log('Auto-authentication successful with Basic Auth');
            return true;
          }
        }
      } catch (error) {
        console.warn('Auto-authentication failed:', error);
        return false;
      }
    }
    
    console.warn('No WordPress credentials found in environment variables');
    return false;
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    if (this.useBasicAuth) {
      return !!this.authToken;
    }
    return !!this.authToken;
  }

  /**
   * Get current auth token
   */
  getAuthToken(): string | undefined {
    return this.authToken;
  }

  /**
   * Authenticate user with Basic Auth (Application Passwords)
   */
  async loginWithBasicAuth(credentials: LoginCredentials): Promise<boolean> {
    try {
      // Create basic auth token
      const basicAuthToken = btoa(`${credentials.username}:${credentials.password}`);
      
      // Test the credentials by trying to access user info
      const response = await this.api.get(`${this.config.baseUrl}/wp-json/wp/v2/users/me`, {
        headers: {
          'Authorization': `Basic ${basicAuthToken}`
        }
      });

      if (response.data) {
        this.authToken = basicAuthToken;
        this.useBasicAuth = true;
        localStorage.setItem('wp_auth_token', basicAuthToken);
        localStorage.setItem('wp_auth_method', 'basic');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Basic auth login failed:', error);
      return false;
    }
  }

  /**
   * Authenticate user and get JWT token
   */
  async login(credentials: LoginCredentials): Promise<AuthState> {
    try {
      const response: AxiosResponse<{ token: string; user: WordPressUser }> = 
        await this.api.post(`${this.config.baseUrl}/wp-json/jwt-auth/v1/token`, credentials);

      const { token, user } = response.data;
      this.setAuthToken(token);

      // Get user permissions
      // Get basic user data (permissions check simplified for now)
      // const permissions = await this.getUserPermissions(user.id);

      return {
        isAuthenticated: true,
        user,
        token,
        permissions: [], // Simplified for now
      };
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Authentication failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Set authentication token (JWT)
   */
  setAuthToken(token: string): void {
    this.authToken = token;
    this.useBasicAuth = false;
    localStorage.setItem('wp_auth_token', token);
    localStorage.setItem('wp_auth_method', 'jwt');
  }

  /**
   * Clear authentication
   */
  clearAuth(): void {
    this.authToken = undefined;
    this.useBasicAuth = false;
    localStorage.removeItem('wp_auth_token');
    localStorage.removeItem('wp_auth_method');
  }

  /**
   * Restore authentication from localStorage
   */
  restoreAuth(): boolean {
    const token = localStorage.getItem('wp_auth_token');
    const authMethod = localStorage.getItem('wp_auth_method');
    
    if (token) {
      this.authToken = token;
      this.useBasicAuth = authMethod === 'basic';
      
      if (this.useBasicAuth) {
        console.log('Restored Basic Auth from localStorage');
        return true;
      } else {
        // For now, just assume token is valid - proper validation can be added later
        console.log('Restored JWT from localStorage');
        return true;
      }
    }
    return false;
  }

  /**
   * Validate authentication token
   */
  async validateToken(): Promise<boolean> {
    if (!this.authToken) return false;

    try {
      if (this.useBasicAuth) {
        // For basic auth, test by accessing user info
        await this.api.get(`${this.config.baseUrl}/wp-json/wp/v2/users/me`);
        return true;
      } else {
        // For JWT, use the validation endpoint
        await this.api.post(`${this.config.baseUrl}/wp-json/jwt-auth/v1/token/validate`);
        return true;
      }
    } catch (error) {
      console.warn('Token validation failed:', error);
      this.clearAuth();
      return false;
    }
  }

  /**
   * Create or update experiment
   */
  async saveExperiment(experiment: Partial<Experiment>): Promise<Experiment> {
    const endpoint = experiment.id 
      ? `/experiments/${experiment.id}`
      : '/experiments';

    const method = experiment.id ? 'put' : 'post';

    // Prepare the data in WordPress format
    const experimentData: Record<string, unknown> = {
      title: experiment.title || `Experiment #${experiment.number?.toString().padStart(3, '0')}`,
      slug: experiment.slug || `experiment-${experiment.number?.toString().padStart(3, '0')}`,
      status: 'publish',
      // Pods custom fields
      experiment_number: experiment.number?.toString().padStart(3, '0'),
      event_date: experiment.date,
      experiment_notes: experiment.notes || '',
    };

    // Add experiment image if provided
    if (experiment.experimentImageId) {
      experimentData.experiment_image = experiment.experimentImageId;
      experimentData.featured_media = experiment.experimentImageId; // Also set as featured image
    }

    // Add host and platforms if provided
    if (experiment.hostId) {
      experimentData.event_host = [experiment.hostId];
    }
    
    if (experiment.platforms && experiment.platforms.length > 0) {
      experimentData.event_location = experiment.platforms.map(p => p.name);
    }

    // Add experiment movies if provided (WordPress expects array of movie IDs)
    if (experiment.movies && experiment.movies.length > 0) {
      experimentData.experiment_movies = experiment.movies.map(movie => movie.wordpressId || movie.id);
    }

    try {
      console.log(`${method.toUpperCase()}ing experiment to ${endpoint}:`, experimentData);
      
      const response: AxiosResponse<WordPressPodsExperiment> = await this.api[method](endpoint, experimentData);
      
      console.log('Experiment save response:', response.data);
      
      // Convert the response back to our app format
      return await this.convertPodsExperimentToApp(response.data);
    } catch (error) {
      console.error('Failed to save experiment:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to ${experiment.id ? 'update' : 'create'} experiment: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Delete experiment
   */
  async deleteExperiment(id: number): Promise<void> {
    try {
      await this.api.delete(`/experiments/${id}`, {
        params: {
          force: true, // Permanently delete instead of moving to trash
        },
      });
    } catch (error) {
      console.error('Failed to delete experiment:', error);
      throw new Error(`Failed to delete experiment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get experiment by ID
   */
  async getExperiment(id: number): Promise<Experiment> {
    try {
      const response: AxiosResponse<WordPressPodsExperiment> = await this.api.get(
        `/experiments/${id}`,
        {
          params: {
            _embed: true,
          },
        }
      );
      return await this.convertPodsExperimentToApp(response.data);
    } catch (error) {
      console.error('WordPress API Error:', error);
      throw error;
    }
  }

  /**
   * Get all experiments with pagination
   */
  async getExperiments(page: number = 1, perPage: number = 10): Promise<{
    experiments: Experiment[];
    totalPages: number;
    total: number;
  }> {
    try {
      const response: AxiosResponse<WordPressPodsExperiment[]> = await this.api.get('/experiments', {
        params: {
          page,
          per_page: perPage,
          _embed: true,
        },
      });

      const experiments = await Promise.all(
        response.data.map(podsExperiment => 
          this.convertPodsExperimentToApp(podsExperiment)
        )
      );

      return {
        experiments,
        totalPages: parseInt(response.headers['x-wp-totalpages'] || '1'),
        total: parseInt(response.headers['x-wp-total'] || '0'),
      };
    } catch (error) {
      console.error('WordPress API Error:', error);
      throw error;
    }
  }

  /**
   * Create or update movie
   */
  async saveMovie(movie: Partial<Movie>): Promise<Movie> {
    const endpoint = movie.wordpressId 
      ? `/movies/${movie.wordpressId}`
      : '/movies';

    const method = movie.wordpressId ? 'put' : 'post';

    // Prepare the data in WordPress format
    const movieData = {
      title: movie.title || '',
      content: movie.overview || '',
      status: 'publish',
      // Pods custom fields go directly as properties
      movie_tmdb_id: movie.tmdbId,
      movie_original_title: movie.originalTitle,
      movie_release_date: movie.releaseDate,
      movie_runtime: movie.runtime,
      movie_budget: movie.budget,
      movie_box_office: movie.revenue,
      movie_tmdb_rating: movie.voteAverage,
      movie_tmdb_votes: movie.voteCount,
      movie_popularity: movie.popularity,
      movie_tagline: movie.tagline,
      movie_poster: movie.posterPath,
      movie_backdrop: movie.backdropPath,
      movie_imdb_id: movie.imdbId,
      movie_original_language: movie.originalLanguage,
      movie_adult: movie.adult,
      movie_video: movie.video,
      movie_content_rating: movie.contentRating,
      movie_trailer: movie.trailerUrl,
      movie_amazon_link: movie.amazonLink,
      movie_overview: movie.overview,
      movie_title: movie.title,
    };

    try {
      console.log(`${method.toUpperCase()}ing movie to ${endpoint}:`, movieData);
      
      const response: AxiosResponse<WordPressPodsMovie> = await this.api[method](endpoint, movieData);
      
      console.log('Movie save response:', response.data);
      
      // Convert the response back to our app format
      return this.convertPodsMovieToApp(response.data);
    } catch (error) {
      console.error('Failed to save movie:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to ${movie.wordpressId ? 'update' : 'create'} movie: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Create or update person (actor, director, etc.)
   */
  async savePerson(person: Partial<Person>): Promise<Person> {
    const endpoint = person.wordpressId 
      ? `/people/${person.wordpressId}`
      : '/people';

    const method = person.wordpressId ? 'put' : 'post';

    const response: AxiosResponse<Person> = await this.api[method](endpoint, {
      title: person.name,
      content: person.biography || '',
      meta: {
        tmdb_id: person.tmdbId,
        birthday: person.birthday,
        deathday: person.deathday,
        place_of_birth: person.placeOfBirth,
        profile_path: person.profilePath,
        popularity: person.popularity,
        adult: person.adult,
        imdb_id: person.imdbId,
        homepage: person.homepage,
        known_for_department: person.knownForDepartment,
      },
      status: 'publish',
    });

    return response.data;
  }

  /**
   * Upload image to WordPress media library
   */
  async uploadImage(imageFile: File | Blob, filename: string): Promise<ProcessedImage> {
    const formData = new FormData();
    formData.append('file', imageFile, filename);

    const response = await this.api.post('/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      thumbnail: response.data,
      standard: response.data,
      highRes: response.data,
      originalUrl: response.data.source_url,
    };
  }

  /**
   * Upload image from URL
   */
  async uploadImageFromUrl(imageUrl: string, filename: string): Promise<ProcessedImage> {
    // Download image
    const imageResponse = await axios.get(imageUrl, { responseType: 'blob' });
    const imageBlob = imageResponse.data;

    return this.uploadImage(imageBlob, filename);
  }

  /**
   * Get all WordPress users
   */
  async getUsers(): Promise<WordPressUser[]> {
    const response: AxiosResponse<WordPressUser[]> = await this.api.get(
      '/users'
    );
    return response.data;
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<WordPressUser> {
    const response: AxiosResponse<WordPressUser> = await this.api.get(
      '/users/me'
    );
    return response.data;
  }

  /**
   * Get event platforms (dynamically fetched from WordPress Pods field configuration)
   */
  async getEventPlatforms(): Promise<EventPlatform[]> {
    console.log('Fetching event platforms...');
    
    // Method 1: Get field configuration from Pods API using correct endpoint
    try {
      console.log('Trying Pods field API endpoint with authentication...');
      
      // Use the correct Pods API endpoint pattern
      const baseUrl = this.config.baseUrl;
      const podsFieldUrl = `${baseUrl}/wp-json/pods/v1/pods/experiment/fields/event_location`;
      console.log('Pods field API URL:', podsFieldUrl);
      
      // Make authenticated request to Pods API
      const response = await this.api.get(podsFieldUrl);
      
      if (response.data && response.data.field && response.data.field.pick_custom) {
        const pickCustom = response.data.field.pick_custom;
        console.log('✅ Found pick_custom field:', pickCustom);
        
        // pick_custom contains newline-separated values
        const platformNames = pickCustom.split('\n').map((name: string) => name.trim()).filter((name: string) => name);
        console.log('✅ Available platforms from Pods:', platformNames);
        return this.mapPlatformNames(platformNames);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('Could not fetch pod field configuration:', errorMessage);
    }

    // Method 2: Try alternative Pods API endpoint (all fields)
    try {
      console.log('Trying alternative Pods fields endpoint...');
      const baseUrl = this.config.baseUrl;
      const podsFieldsUrl = `${baseUrl}/wp-json/pods/v1/fields`;
      
      const response = await this.api.get(podsFieldsUrl);
      
      if (response.data && response.data.fields) {
        const eventLocationField = response.data.fields.find((field: { name: string }) => field.name === 'event_location');
        if (eventLocationField && (eventLocationField as { pick_custom?: string }).pick_custom) {
          const pickCustom = (eventLocationField as { pick_custom: string }).pick_custom;
          console.log('✅ Found pick_custom from fields endpoint:', pickCustom);
          
          const platformNames = pickCustom.split('\n').map((name: string) => name.trim()).filter((name: string) => name);
          console.log('✅ Available platforms from Pods fields:', platformNames);
          return this.mapPlatformNames(platformNames);
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('Could not fetch from Pods fields endpoint:', errorMessage);
    }

    // Method 3: Get platform options from existing experiments
    try {
      console.log('Trying to get platforms from existing experiments...');
      const experimentsResponse = await this.api.get('/experiments', {
        params: { per_page: 10, _embed: true }
      });
      
      if (experimentsResponse.data.length > 0) {
        const allPlatforms = new Set<string>();
        
        experimentsResponse.data.forEach((experiment: { event_location?: string | string[] }) => {
          if (experiment.event_location) {
            if (Array.isArray(experiment.event_location)) {
              experiment.event_location.forEach((platform: string) => {
                if (typeof platform === 'string') {
                  allPlatforms.add(platform.trim());
                }
              });
            } else if (typeof experiment.event_location === 'string') {
              allPlatforms.add(experiment.event_location.trim());
            }
          }
        });
        
        if (allPlatforms.size > 0) {
          const platformNames = Array.from(allPlatforms);
          console.log('Found platforms from existing experiments:', platformNames);
          return this.mapPlatformNames(platformNames);
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('Could not fetch platforms from existing experiments:', errorMessage);
    }

    // Method 4: Fallback to known platforms based on Pods structure
    console.warn('Using fallback platform list based on known Pods structure');
    // These are the platforms defined in the pods-structure.json pick_custom field
    const fallbackPlatforms = ['Bigscreen VR', 'Discord', 'Twitch', 'Youtube'];
    return this.mapPlatformNames(fallbackPlatforms);
  }

  /**
   * Map platform names to EventPlatform objects
   */
  private mapPlatformNames(platformNames: string[]): EventPlatform[] {
    return platformNames.map((name, index) => ({
      id: index + 1,
      name: name.trim(),
      description: this.getPlatformDescription(name.trim()),
      url: this.getPlatformUrl(name.trim()),
      icon: '',
      color: this.getPlatformColor(name.trim()),
      isDefault: name.trim() === 'Bigscreen VR', // Only Bigscreen VR is default
      wordpressId: index + 1,
      slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  /**
   * Get platform description
   */
  private getPlatformDescription(platformName: string): string {
    const descriptions: Record<string, string> = {
      'Bigscreen VR': 'Virtual reality movie watching',
      'Discord': 'Voice chat during movies',
      'Twitch': 'Live streaming platform',
      'Youtube': 'Video sharing platform',
      'Vimeo': 'Video hosting platform',
      'test': 'Test platform for experimentation'
    };
    return descriptions[platformName] || `Platform: ${platformName}`;
  }

  /**
   * Get platform color for UI
   */
  private getPlatformColor(platformName: string): string {
    const colors: Record<string, string> = {
      'Bigscreen VR': '#FF6B6B',
      'Discord': '#5865F2',
      'Twitch': '#9146FF',
      'Youtube': '#FF0000',
      'Vimeo': '#1AB7EA',
      'test': '#10B981'
    };
    return colors[platformName] || '#6B7280';
  }

  /**
   * Get platform URL
   */
  private getPlatformUrl(platformName: string): string {
    const urls: Record<string, string> = {
      'Bigscreen VR': 'https://bigscreenvr.com',
      'Discord': 'https://discord.com',
      'Twitch': 'https://twitch.tv',
      'Youtube': 'https://youtube.com',
      'Vimeo': 'https://vimeo.com',
      'test': ''
    };
    return urls[platformName] || '';
  }

  /**
   * Create event platform
   */
  async createEventPlatform(platform: Partial<EventPlatform>): Promise<EventPlatform> {
    const response: AxiosResponse<EventPlatform> = await this.api.post(
      '/event-platforms',
      {
        title: platform.name,
        content: platform.description || '',
        meta: {
          platform_url: platform.url,
          platform_icon: platform.icon,
          platform_color: platform.color,
          is_default: platform.isDefault,
        },
        status: 'publish',
      }
    );
    return response.data;
  }

  /**
   * Batch create/update entities
   */
  async batchSave<T>(entities: Partial<T>[], entityType: string): Promise<T[]> {
    const promises = entities.map(entity => {
      switch (entityType) {
        case 'movie':
          return this.saveMovie(entity as Partial<Movie>);
        case 'person':
          return this.savePerson(entity as Partial<Person>);
        default:
          throw new Error(`Unsupported entity type: ${entityType}`);
      }
    });

    return Promise.all(promises) as Promise<T[]>;
  }

  /**
   * Search entities by type
   */
  async searchEntities(entityType: string, query: string): Promise<unknown[]> {
    const response = await this.api.get(`/${entityType}`, {
      params: {
        search: query,
        per_page: 20,
      },
    });
    return response.data;
  }

  /**
   * Test connection to WordPress API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.api.get('/');
      return true;
    } catch (error) {
      console.error('WordPress connection test failed:', error);
      return false;
    }
  }

  /**
   * Get WordPress site info
   */
  async getSiteInfo(): Promise<{ name: string; url: string; description: string }> {
    const response = await this.api.get('/');
    return {
      name: response.data.name || 'WordPress Site',
      url: this.config.baseUrl,
      description: response.data.description || ''
    };
  }

  /**
   * Convert WordPress Pods experiment to app format
   */
  private async convertPodsExperimentToApp(podsExperiment: WordPressPodsExperiment): Promise<Experiment> {
    const host: WordPressUser = {
      id: podsExperiment.event_host[0]?.id || 1,
      username: podsExperiment.event_host[0]?.user_login || 'admin',
      email: podsExperiment.event_host[0]?.user_email || '',
      displayName: podsExperiment.event_host[0]?.display_name || '',
      firstName: podsExperiment.event_host[0]?.display_name || '',
      lastName: '',
      avatar: '',
      roles: ['administrator'],
      capabilities: ['manage_options'],
      registeredDate: podsExperiment.event_host[0]?.user_registered || new Date().toISOString()
    };

    const platforms: EventPlatform[] = podsExperiment.event_location.map((location, index) => ({
      id: index + 1,
      name: location,
      url: this.getPlatformUrl(location),
      isDefault: index === 0,
      wordpressId: index + 1,
      slug: location.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    // Handle experiment movies safely
    let movies: Movie[] = [];
    if (Array.isArray(podsExperiment.experiment_movies) && podsExperiment.experiment_movies.length > 0) {
      try {
        movies = await Promise.all(
          podsExperiment.experiment_movies.map(movie => 
            this.convertPodsMovieToApp(movie)
          )
        );
      } catch (error) {
        console.warn('Failed to convert experiment movies:', error);
        movies = []; // Fallback to empty array
      }
    }

    // Handle experiment image with proper source_url fetching
    let posterImage: string | undefined;
    
    if (typeof podsExperiment.experiment_image === 'string' && podsExperiment.experiment_image) {
      // Handle string URL case
      posterImage = await this.getMediaSourceUrl(podsExperiment.experiment_image);
    } else if (typeof podsExperiment.experiment_image === 'object' && podsExperiment.experiment_image) {
      // Handle object case (WordPress media object)
      const imageObj = podsExperiment.experiment_image as { url?: string; guid?: string; source_url?: string };
      if (imageObj.url) {
        posterImage = await this.getMediaSourceUrl(imageObj.url);
      } else if (imageObj.guid) {
        posterImage = await this.getMediaSourceUrl(imageObj.guid);
      } else if (imageObj.source_url) {
        posterImage = imageObj.source_url;
      }
    }

    return {
      id: podsExperiment.id,
      number: parseInt(podsExperiment.experiment_number),
      title: podsExperiment.title.rendered,
      date: podsExperiment.event_date,
      hostId: host.id,
      host,
      platforms,
      notes: podsExperiment.experiment_notes,
      posterImage,
      experimentImageId: typeof podsExperiment.experiment_image === 'number' ? podsExperiment.experiment_image : undefined,
      status: 'Completed',
      movies,
      wordpressId: podsExperiment.id,
      slug: `experiment-${podsExperiment.experiment_number}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Get media details by URL to fetch the source_url with Optimole CDN
   */
  private async getMediaSourceUrl(wordpressUrl: string): Promise<string> {
    try {
      // Extract filename from WordPress URL
      const filename = wordpressUrl.split('/').pop()?.split('.')[0];
      if (!filename) return wordpressUrl;

      // Search for media by filename
      const response = await this.api.get('/media', {
        params: {
          search: filename,
          per_page: 1,
          _embed: true
        }
      });

      if (response.data && response.data.length > 0) {
        const media = response.data[0];
        // Return the source_url which should be the Optimole CDN URL
        return media.source_url || wordpressUrl;
      }
      
      return wordpressUrl;
    } catch (error) {
      console.warn('Failed to fetch media source_url:', error);
      return wordpressUrl;
    }
  }

  /**
   * Convert WordPress Pods movie to app format
   */
  private async convertPodsMovieToApp(podsMovie: WordPressPodsMovie): Promise<Movie> {
    // Handle movie_poster - get the source_url with Optimole CDN
    let posterPath = '';
    
    // First, try to get the poster from embedded media data (this should have the Optimole CDN URL)
    if (podsMovie._embedded && podsMovie._embedded['wp:featuredmedia']) {
      const featuredMedia = podsMovie._embedded['wp:featuredmedia'][0];
      if (featuredMedia && featuredMedia.source_url) {
        posterPath = featuredMedia.source_url;
      }
    }
    
    // Fallback: if no embedded media, try the movie_poster field
    if (!posterPath && podsMovie.movie_poster) {
      if (typeof podsMovie.movie_poster === 'string') {
        posterPath = await this.getMediaSourceUrl(podsMovie.movie_poster);
      } else if (typeof podsMovie.movie_poster === 'object' && podsMovie.movie_poster !== null) {
        const posterObj = podsMovie.movie_poster as { source_url?: string; url?: string; guid?: string };
        if (posterObj.source_url) {
          posterPath = posterObj.source_url;
        } else if (posterObj.url) {
          posterPath = posterObj.url;
        } else if (posterObj.guid) {
          posterPath = posterObj.guid;
        }
      }
    }
    
    return {
      id: podsMovie.id || 0,
      tmdbId: parseInt(podsMovie.movie_tmdb_id) || 0,
      title: podsMovie.movie_title || podsMovie.title?.rendered || 'Unknown Movie',
      originalTitle: podsMovie.movie_original_title || podsMovie.movie_title || 'Unknown Movie',
      overview: podsMovie.movie_overview || '',
      releaseDate: podsMovie.movie_release_date || new Date().toISOString().split('T')[0],
      runtime: parseInt(podsMovie.movie_runtime) || 0,
      budget: parseInt(podsMovie.movie_budget) || 0,
      revenue: parseInt(podsMovie.movie_box_office) || 0,
      popularity: 0,
      voteAverage: parseFloat(podsMovie.movie_tmdb_rating) || 0,
      voteCount: parseInt(podsMovie.movie_tmdb_votes) || 0,
      tagline: podsMovie.movie_tagline || '',
      posterPath: posterPath,
      backdropPath: podsMovie.movie_backdrop || '',
      imdbId: podsMovie.movie_imdb_id || '',
      originalLanguage: 'en',
      adult: false,
      video: false,
      contentRating: podsMovie.movie_content_rating || '',
      trailerUrl: podsMovie.movie_trailer || '',
      amazonLink: podsMovie.movie_amazon_link || '',
      genres: [],
      cast: [],
      crew: [],
      studios: [],
      countries: [],
      languages: [],
      keywords: [],
      wordpressId: podsMovie.id || 0,
      slug: (podsMovie.movie_title || podsMovie.title?.rendered || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Get the next experiment number (e.g., "001", "002", "012")
   */
  async getNextExperimentNumber(): Promise<string> {
    try {
      console.log('Fetching experiments to determine next experiment number...');
      
      // Get all experiments, sorted by experiment number (newest first)
      const response: AxiosResponse<WordPressPodsExperiment[]> = await this.api.get('/experiments', {
        params: {
          per_page: 100, // Get enough to find the highest number
          orderby: 'date',
          order: 'desc',
          _embed: true,
        },
      });

      let highestNumber = 0;
      
      // Find the highest experiment number
      response.data.forEach((experiment) => {
        if (experiment.experiment_number) {
          // Parse the experiment number (remove any non-numeric characters)
          const numberStr = experiment.experiment_number.replace(/\D/g, '');
          const number = parseInt(numberStr);
          if (!isNaN(number) && number > highestNumber) {
            highestNumber = number;
          }
        }
      });

      // Next number is highest + 1, formatted as 3-digit string
      const nextNumber = highestNumber + 1;
      const formattedNumber = nextNumber.toString().padStart(3, '0');
      
      console.log(`Highest experiment number found: ${highestNumber}, next will be: ${formattedNumber}`);
      
      return formattedNumber;
    } catch (error) {
      console.warn('Failed to fetch experiments for number generation:', error);
      // Fallback to "001" if we can't fetch existing experiments
      return '001';
    }
  }

  /**
   * Generic method to create a post of any custom post type
   */
  async createPost(postType: string, postData: {
    title: string;
    status?: string;
    featured_media?: number;
    meta?: Record<string, string | number | boolean | (string | number)[]>;
  }): Promise<{ id: number; title: string; status: string }> {
    try {
      const response = await this.api.post(`/${postType}`, {
        title: postData.title,
        status: postData.status || 'publish',
        featured_media: postData.featured_media,
        meta: postData.meta || {}
      });

      return response.data;
    } catch (error) {
      console.error(`Failed to create ${postType}:`, error);
      throw new Error(`Failed to create ${postType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search for existing posts by custom field value
   */
  async searchPostsByMeta(
    postType: string,
    metaKey: string,
    metaValue: string | number
  ): Promise<{ id: number; title: string; status: string }[]> {
    try {
      const response = await this.api.get(`/${postType}`, {
        params: {
          meta_key: metaKey,
          meta_value: metaValue,
          per_page: 10
        }
      });

      return response.data;
    } catch (error) {
      console.warn(`Failed to search ${postType} by meta:`, error);
      return [];
    }
  }

  /**
   * Get media details by ID to fetch Optimole CDN URLs
   */
  async getMovieById(id: number): Promise<Movie> {
    try {
      const response = await this.api.get(`/movies/${id}`);
      return this.convertPodsMovieToApp(response.data);
    } catch (error) {
      console.error('Failed to get movie:', error);
      throw new Error(`Failed to get movie: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default WordPressService;
