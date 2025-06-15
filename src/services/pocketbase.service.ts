import PocketBase from 'pocketbase';

// Connect to your remote PocketBase instance
const pb = new PocketBase('https://bsbm-pocketbase.cap.dasco.services');

// Comprehensive types matching the WordPress Pods structure
export interface Movie {
  id?: string;
  // Core movie info
  movie_title: string;
  movie_original_title?: string;
  movie_year?: string;
  movie_release_date?: string;
  movie_runtime?: number;
  movie_tagline?: string;
  movie_overview?: string;
  movie_content_rating?: string;
  
  // Financial info
  movie_budget?: string;
  movie_box_office?: string;
  
  // Media files
  movie_poster?: string;
  movie_backdrop?: string;
  movie_trailer?: string;
  
  // External IDs and ratings
  movie_tmdb_id?: number;
  movie_tmdb_url?: string;
  movie_tmdb_rating?: number;
  movie_tmdb_votes?: number;
  movie_imdb_id?: string;
  movie_imdb_url?: string;
  
  // Characters (JSON field for repeatable data)
  movie_characters?: string;
  
  // Affiliate links
  movie_amazon_link?: string;
  
  // System fields
  wordpress_id?: number;
  sync_status?: 'pending' | 'synced' | 'error';
  last_synced?: string;
  last_tmdb_fetch?: string;
  created?: string;
  updated?: string;
}

export interface Actor {
  id?: string;
  // Core fields
  actor_name: string;
  profile_image?: string;
  
  // Biography and personal info
  actor_biography?: string;
  actor_birthday?: string;
  actor_deathday?: string;
  actor_place_of_birth?: string;
  
  // Career info
  actor_movie_count?: number;
  actor_popularity?: number;
  actor_known_for_department?: string;
  
  // External IDs and URLs
  actor_imdb_id?: string;
  actor_imdb_url?: string;
  actor_tmdb_url?: string;
  
  // Social media
  actor_instagram_id?: string;
  actor_twitter_id?: string;
  actor_facebook_id?: string;
  
  // System fields
  tmdb_id?: number;
  wordpress_id?: number;
  sync_status?: 'pending' | 'synced' | 'error';
  last_synced?: string;
  created?: string;
  updated?: string;
}

export interface Director {
  id?: string;
  // Core fields
  director_name: string;
  director_profile_image?: string;
  
  // Biography and personal info
  director_biography?: string;
  director_birthday?: string;
  director_deathday?: string;
  director_place_of_birth?: string;
  
  // Career info
  director_movie_count?: number;
  director_popularity?: number;
  
  // External IDs and URLs
  director_imdb_id?: string;
  director_imdb_url?: string;
  director_tmdb_url?: string;
  
  // Social media
  director_instagram_id?: string;
  director_twitter_id?: string;
  director_facebook_id?: string;
  
  // System fields
  tmdb_id?: number;
  wordpress_id?: number;
  sync_status?: 'pending' | 'synced' | 'error';
  last_synced?: string;
  created?: string;
  updated?: string;
}

export interface Writer {
  id?: string;
  // Core fields
  writer_name: string;
  writer_profile_image?: string;
  
  // Biography and personal info
  writer_biography?: string;
  writer_birthday?: string;
  writer_deathday?: string;
  writer_place_of_birth?: string;
  
  // Career info
  writer_movie_count?: number;
  writer_popularity?: number;
  writer_tmdb_id?: number;
  
  // External URLs
  writer_imdb_url?: string;
  writer_tmdb_url?: string;
  
  // Social media
  writer_instagram_id?: string;
  writer_twitter_id?: string;
  writer_facebook_id?: string;
  
  // System fields
  wordpress_id?: number;
  sync_status?: 'pending' | 'synced' | 'error';
  last_synced?: string;
  created?: string;
  updated?: string;
}

export interface Studio {
  id?: string;
  // Core fields
  studio_name: string;
  studio_logo?: string;
  
  // Details
  studio_headquarters?: string;
  studio_description?: string;
  studio_url?: string;
  
  // System fields
  studio_tmdb_id?: number;
  wordpress_id?: number;
  sync_status?: 'pending' | 'synced' | 'error';
  last_synced?: string;
  created?: string;
  updated?: string;
}

export interface Genre {
  id?: string;
  genre_name: string;
  tmdb_id?: number;
  wordpress_id?: number;
  sync_status?: 'pending' | 'synced' | 'error';
  last_synced?: string;
  created?: string;
  updated?: string;
}

export interface Country {
  id?: string;
  country_name: string;
  iso_code?: string;
  wordpress_id?: number;
  sync_status?: 'pending' | 'synced' | 'error';
  last_synced?: string;
  created?: string;
  updated?: string;
}

export interface Language {
  id?: string;
  language_name: string;
  iso_code?: string;
  wordpress_id?: number;
  sync_status?: 'pending' | 'synced' | 'error';
  last_synced?: string;
  created?: string;
  updated?: string;
}

export interface Experiment {
  id?: string;
  // Core fields
  experiment_number?: string;
  event_date?: string;
  event_location?: string[];
  event_host?: string;
  experiment_image?: string;
  experiment_notes?: string;
  
  // System fields
  wordpress_id?: number;
  sync_status?: 'pending' | 'synced' | 'error';
  last_synced?: string;
  created?: string;
  updated?: string;
}

// Relationship interfaces
export interface MovieActor {
  id?: string;
  movie: string; // relation ID
  actor: string; // relation ID
  character_name?: string;
  role_order?: number;
  created?: string;
  updated?: string;
}

export interface MovieDirector {
  id?: string;
  movie: string; // relation ID
  director: string; // relation ID
  created?: string;
  updated?: string;
}

export interface MovieWriter {
  id?: string;
  movie: string; // relation ID
  writer: string; // relation ID
  created?: string;
  updated?: string;
}

export interface MovieGenre {
  id?: string;
  movie: string; // relation ID
  genre: string; // relation ID
  created?: string;
  updated?: string;
}

export interface MovieCountry {
  id?: string;
  movie: string; // relation ID
  country: string; // relation ID
  created?: string;
  updated?: string;
}

export interface MovieLanguage {
  id?: string;
  movie: string; // relation ID
  language: string; // relation ID
  created?: string;
  updated?: string;
}

export interface MovieStudio {
  id?: string;
  movie: string; // relation ID
  studio: string; // relation ID
  created?: string;
  updated?: string;
}

export interface ExperimentMovie {
  id?: string;
  experiment: string; // relation ID
  movie: string; // relation ID
  experiment_notes?: string;
  date_added?: string;
  created?: string;
  updated?: string;
}

class PocketBaseService {
  
  async loginAdmin() {
    try {
      await pb.admins.authWithPassword('dallensmith@gmail.com', 'BRpFPuAu7EACnUAhb7Xei4rJEu');
      return true;
    } catch (error) {
      console.error('❌ Admin login failed:', error);
      return false;
    }
  }

  isAuthenticated() {
    return pb.authStore.isValid;
  }

  logout() {
    pb.authStore.clear();
  }

  // ========================================
  // MOVIE METHODS
  // ========================================
  async getAllMovies(): Promise<Movie[]> {
    try {
      return await pb.collection('movies').getFullList<Movie>();
    } catch (error) {
      console.error('Error fetching movies:', error);
      throw error;
    }
  }

  async getMovies(page: number = 1, perPage: number = 50): Promise<{ items: Movie[], totalItems: number, totalPages: number }> {
    try {
      const result = await pb.collection('movies').getList(page, perPage);
      return {
        items: result.items as unknown as Movie[],
        totalItems: result.totalItems,
        totalPages: result.totalPages
      };
    } catch (error) {
      console.error('Error fetching movies:', error);
      throw error;
    }
  }

  async getMovie(id: string): Promise<Movie> {
    try {
      return await pb.collection('movies').getOne<Movie>(id);
    } catch (error) {
      console.error('Error fetching movie:', error);
      throw error;
    }
  }

  async createMovie(movie: Omit<Movie, 'id' | 'created' | 'updated'>): Promise<Movie> {
    try {
      return await pb.collection('movies').create<Movie>(movie);
    } catch (error) {
      console.error('Error creating movie:', error);
      throw error;
    }
  }

  async updateMovie(id: string, movie: Partial<Movie>): Promise<Movie> {
    try {
      return await pb.collection('movies').update<Movie>(id, movie);
    } catch (error) {
      console.error('Error updating movie:', error);
      throw error;
    }
  }

  async deleteMovie(id: string): Promise<boolean> {
    try {
      await pb.collection('movies').delete(id);
      return true;
    } catch (error) {
      console.error('Error deleting movie:', error);
      return false;
    }
  }

  async findMovieByTmdbId(tmdbId: number): Promise<Movie | null> {
    try {
      const results = await pb.collection('movies').getFullList<Movie>({
        filter: `movie_tmdb_id = ${tmdbId}`
      });
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error finding movie by TMDb ID:', error);
      return null;
    }
  }

  async searchMovies(query: string): Promise<Movie[]> {
    try {
      return await pb.collection('movies').getFullList<Movie>({
        filter: `movie_title ~ "${query}" || movie_original_title ~ "${query}"`
      });
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  }

  // ========================================
  // ACTOR METHODS
  // ========================================
  async getAllActors(): Promise<Actor[]> {
    try {
      return await pb.collection('actors').getFullList<Actor>();
    } catch (error) {
      console.error('Error fetching actors:', error);
      throw error;
    }
  }

  async getActor(id: string): Promise<Actor> {
    try {
      return await pb.collection('actors').getOne<Actor>(id);
    } catch (error) {
      console.error('Error fetching actor:', error);
      throw error;
    }
  }

  async createActor(actor: Omit<Actor, 'id' | 'created' | 'updated'>): Promise<Actor> {
    try {
      return await pb.collection('actors').create<Actor>(actor);
    } catch (error) {
      console.error('Error creating actor:', error);
      throw error;
    }
  }

  async updateActor(id: string, actor: Partial<Actor>): Promise<Actor> {
    try {
      return await pb.collection('actors').update<Actor>(id, actor);
    } catch (error) {
      console.error('Error updating actor:', error);
      throw error;
    }
  }

  async findActorByTmdbId(tmdbId: number): Promise<Actor | null> {
    try {
      const results = await pb.collection('actors').getFullList<Actor>({
        filter: `tmdb_id = ${tmdbId}`
      });
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error finding actor by TMDb ID:', error);
      return null;
    }
  }

  async searchActors(query: string): Promise<Actor[]> {
    try {
      return await pb.collection('actors').getFullList<Actor>({
        filter: `actor_name ~ "${query}"`
      });
    } catch (error) {
      console.error('Error searching actors:', error);
      throw error;
    }
  }

  // ========================================
  // DIRECTOR METHODS
  // ========================================
  async getAllDirectors(): Promise<Director[]> {
    try {
      return await pb.collection('directors').getFullList<Director>();
    } catch (error) {
      console.error('Error fetching directors:', error);
      throw error;
    }
  }

  async createDirector(director: Omit<Director, 'id' | 'created' | 'updated'>): Promise<Director> {
    try {
      return await pb.collection('directors').create<Director>(director);
    } catch (error) {
      console.error('Error creating director:', error);
      throw error;
    }
  }

  async findDirectorByTmdbId(tmdbId: number): Promise<Director | null> {
    try {
      const results = await pb.collection('directors').getFullList<Director>({
        filter: `tmdb_id = ${tmdbId}`
      });
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error finding director by TMDb ID:', error);
      return null;
    }
  }

  // ========================================
  // WRITER METHODS
  // ========================================
  async getAllWriters(): Promise<Writer[]> {
    try {
      return await pb.collection('writers').getFullList<Writer>();
    } catch (error) {
      console.error('Error fetching writers:', error);
      throw error;
    }
  }

  async createWriter(writer: Omit<Writer, 'id' | 'created' | 'updated'>): Promise<Writer> {
    try {
      return await pb.collection('writers').create<Writer>(writer);
    } catch (error) {
      console.error('Error creating writer:', error);
      throw error;
    }
  }

  async findWriterByTmdbId(tmdbId: number): Promise<Writer | null> {
    try {
      const results = await pb.collection('writers').getFullList<Writer>({
        filter: `writer_tmdb_id = ${tmdbId}`
      });
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error finding writer by TMDb ID:', error);
      return null;
    }
  }

  // ========================================
  // STUDIO METHODS
  // ========================================
  async getAllStudios(): Promise<Studio[]> {
    try {
      return await pb.collection('studios').getFullList<Studio>();
    } catch (error) {
      console.error('Error fetching studios:', error);
      throw error;
    }
  }

  async createStudio(studio: Omit<Studio, 'id' | 'created' | 'updated'>): Promise<Studio> {
    try {
      return await pb.collection('studios').create<Studio>(studio);
    } catch (error) {
      console.error('Error creating studio:', error);
      throw error;
    }
  }

  async findStudioByTmdbId(tmdbId: number): Promise<Studio | null> {
    try {
      const results = await pb.collection('studios').getFullList<Studio>({
        filter: `studio_tmdb_id = ${tmdbId}`
      });
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error finding studio by TMDb ID:', error);
      return null;
    }
  }

  // ========================================
  // GENRE METHODS
  // ========================================
  async getAllGenres(): Promise<Genre[]> {
    try {
      return await pb.collection('genres').getFullList<Genre>();
    } catch (error) {
      console.error('Error fetching genres:', error);
      throw error;
    }
  }

  async createGenre(genre: Omit<Genre, 'id' | 'created' | 'updated'>): Promise<Genre> {
    try {
      return await pb.collection('genres').create<Genre>(genre);
    } catch (error) {
      console.error('Error creating genre:', error);
      throw error;
    }
  }

  async findGenreByTmdbId(tmdbId: number): Promise<Genre | null> {
    try {
      const results = await pb.collection('genres').getFullList<Genre>({
        filter: `tmdb_id = ${tmdbId}`
      });
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error finding genre by TMDb ID:', error);
      return null;
    }
  }

  // ========================================
  // COUNTRY & LANGUAGE METHODS
  // ========================================
  async getAllCountries(): Promise<Country[]> {
    try {
      return await pb.collection('countries').getFullList<Country>();
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  }

  async createCountry(country: Omit<Country, 'id' | 'created' | 'updated'>): Promise<Country> {
    try {
      return await pb.collection('countries').create<Country>(country);
    } catch (error) {
      console.error('Error creating country:', error);
      throw error;
    }
  }

  async getAllLanguages(): Promise<Language[]> {
    try {
      return await pb.collection('languages').getFullList<Language>();
    } catch (error) {
      console.error('Error fetching languages:', error);
      throw error;
    }
  }

  async createLanguage(language: Omit<Language, 'id' | 'created' | 'updated'>): Promise<Language> {
    try {
      return await pb.collection('languages').create<Language>(language);
    } catch (error) {
      console.error('Error creating language:', error);
      throw error;
    }
  }

  // ========================================
  // EXPERIMENT METHODS
  // ========================================
  async getAllExperiments(): Promise<Experiment[]> {
    try {
      return await pb.collection('experiments').getFullList<Experiment>();
    } catch (error) {
      console.error('Error fetching experiments:', error);
      throw error;
    }
  }

  async createExperiment(experiment: Omit<Experiment, 'id' | 'created' | 'updated'>): Promise<Experiment> {
    try {
      return await pb.collection('experiments').create<Experiment>(experiment);
    } catch (error) {
      console.error('Error creating experiment:', error);
      throw error;
    }
  }

  async deleteExperiment(id: string): Promise<boolean> {
    try {
      await pb.collection('experiments').delete(id);
      return true;
    } catch (error) {
      console.error('Error deleting experiment:', error);
      return false;
    }
  }

  // ========================================
  // RELATIONSHIP METHODS
  // ========================================
  async addActorToMovie(movieId: string, actorId: string, characterName?: string, roleOrder?: number): Promise<MovieActor> {
    try {
      return await pb.collection('movie_actors').create<MovieActor>({
        movie: movieId,
        actor: actorId,
        character_name: characterName,
        role_order: roleOrder
      });
    } catch (error) {
      console.error('Error adding actor to movie:', error);
      throw error;
    }
  }

  async addDirectorToMovie(movieId: string, directorId: string): Promise<MovieDirector> {
    try {
      return await pb.collection('movie_directors').create<MovieDirector>({
        movie: movieId,
        director: directorId
      });
    } catch (error) {
      console.error('Error adding director to movie:', error);
      throw error;
    }
  }

  async addWriterToMovie(movieId: string, writerId: string): Promise<MovieWriter> {
    try {
      return await pb.collection('movie_writers').create<MovieWriter>({
        movie: movieId,
        writer: writerId
      });
    } catch (error) {
      console.error('Error adding writer to movie:', error);
      throw error;
    }
  }

  async addGenreToMovie(movieId: string, genreId: string): Promise<MovieGenre> {
    try {
      return await pb.collection('movie_genres').create<MovieGenre>({
        movie: movieId,
        genre: genreId
      });
    } catch (error) {
      console.error('Error adding genre to movie:', error);
      throw error;
    }
  }

  async addStudioToMovie(movieId: string, studioId: string): Promise<MovieStudio> {
    try {
      return await pb.collection('movie_studios').create<MovieStudio>({
        movie: movieId,
        studio: studioId
      });
    } catch (error) {
      console.error('Error adding studio to movie:', error);
      throw error;
    }
  }

  async addCountryToMovie(movieId: string, countryId: string): Promise<MovieCountry> {
    try {
      return await pb.collection('movie_countries').create<MovieCountry>({
        movie: movieId,
        country: countryId
      });
    } catch (error) {
      console.error('Error adding country to movie:', error);
      throw error;
    }
  }

  async addLanguageToMovie(movieId: string, languageId: string): Promise<MovieLanguage> {
    try {
      return await pb.collection('movie_languages').create<MovieLanguage>({
        movie: movieId,
        language: languageId
      });
    } catch (error) {
      console.error('Error adding language to movie:', error);
      throw error;
    }
  }

  async addMovieToExperiment(experimentId: string, movieId: string, notes?: string): Promise<ExperimentMovie> {
    try {
      return await pb.collection('experiment_movies').create<ExperimentMovie>({
        experiment: experimentId,
        movie: movieId,
        experiment_notes: notes,
        date_added: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding movie to experiment:', error);
      throw error;
    }
  }

  // ========================================
  // RELATIONSHIP QUERY METHODS
  // ========================================
  async getMovieActors(movieId: string): Promise<MovieActor[]> {
    try {
      return await pb.collection('movie_actors').getFullList<MovieActor>({
        filter: `movie = "${movieId}"`,
        expand: 'actor'
      });
    } catch (error) {
      console.error('Error fetching movie actors:', error);
      throw error;
    }
  }

  async getMovieDirectors(movieId: string): Promise<MovieDirector[]> {
    try {
      return await pb.collection('movie_directors').getFullList<MovieDirector>({
        filter: `movie = "${movieId}"`,
        expand: 'director'
      });
    } catch (error) {
      console.error('Error fetching movie directors:', error);
      throw error;
    }
  }

  async getMovieWriters(movieId: string): Promise<MovieWriter[]> {
    try {
      return await pb.collection('movie_writers').getFullList<MovieWriter>({
        filter: `movie = "${movieId}"`,
        expand: 'writer'
      });
    } catch (error) {
      console.error('Error fetching movie writers:', error);
      throw error;
    }
  }

  async getMovieGenres(movieId: string): Promise<MovieGenre[]> {
    try {
      return await pb.collection('movie_genres').getFullList<MovieGenre>({
        filter: `movie = "${movieId}"`,
        expand: 'genre'
      });
    } catch (error) {
      console.error('Error fetching movie genres:', error);
      throw error;
    }
  }

  async getExperimentMovies(experimentId: string): Promise<ExperimentMovie[]> {
    try {
      return await pb.collection('experiment_movies').getFullList<ExperimentMovie>({
        filter: `experiment = "${experimentId}"`,
        expand: 'movie'
      });
    } catch (error) {
      console.error('Error fetching experiment movies:', error);
      throw error;
    }
  }
}

export const pocketbaseService = new PocketBaseService();
export default pocketbaseService;
