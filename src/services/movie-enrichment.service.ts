import TMDbService from './tmdb.service';
import WordPressService from './wordpress.service';
import { config } from '../utils/config';
import type { TMDbMovie, TMDbMovieDetails } from '../types';

// Define additional types for TMDb API responses
interface TMDbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface TMDbCrewMember {
  id: number;
  name: string;
  job: string;
  profile_path: string | null;
}

interface TMDbCredits {
  cast: TMDbCastMember[];
  crew: TMDbCrewMember[];
}

interface TMDbGenre {
  id: number;
  name: string;
}

interface TMDbProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country?: string;
}

interface TMDbProductionCountry {
  iso_3166_1: string;
  name: string;
}

interface TMDbSpokenLanguage {
  iso_639_1: string;
  name: string;
  english_name: string;
}

interface EnrichedMovieData {
  // Core movie data
  movie: TMDbMovieDetails;
  
  // Relational entities that need to be created in WordPress
  actors: EnrichedActor[];
  directors: EnrichedDirector[];
  writers: EnrichedWriter[];
  genres: EnrichedGenre[];
  studios: EnrichedStudio[];
  countries: EnrichedCountry[];
  languages: EnrichedLanguage[];
  
  // Progress tracking
  enrichmentProgress: {
    step: string;
    progress: number;
    total: number;
  };
}

interface EnrichedActor {
  tmdb_id: number;
  name: string;
  character?: string;
  profile_path?: string;
  biography?: string;
  birthday?: string;
  deathday?: string;
  place_of_birth?: string;
  profile_image_url?: string;
}

interface EnrichedDirector {
  tmdb_id: number;
  name: string;
  profile_path?: string;
  biography?: string;
  birthday?: string;
  deathday?: string;
  place_of_birth?: string;
  profile_image_url?: string;
}

interface EnrichedWriter {
  tmdb_id: number;
  name: string;
  profile_path?: string;
  biography?: string;
  birthday?: string;
  deathday?: string;
  place_of_birth?: string;
  profile_image_url?: string;
}

interface EnrichedGenre {
  tmdb_id: number;
  name: string;
}

interface EnrichedStudio {
  tmdb_id: number;
  name: string;
  logo_path?: string;
  origin_country?: string;
  headquarters?: string;
}

interface EnrichedCountry {
  iso_3166_1: string;
  name: string;
}

interface EnrichedLanguage {
  iso_639_1: string;
  name: string;
  english_name: string;
}

export class MovieEnrichmentService {
  private tmdbService: TMDbService;
  private wordPressService: WordPressService;

  constructor() {
    this.tmdbService = new TMDbService(config.tmdb);
    this.wordPressService = new WordPressService(config.wordpress);
  }

  /**
   * Main enrichment method - fetches all movie data and related entities
   */
  async enrichMovieData(
    tmdbMovie: TMDbMovie,
    onProgress?: (progress: { step: string; progress: number; total: number }) => void
  ): Promise<EnrichedMovieData> {
    const totalSteps = 8;
    let currentStep = 0;

    const updateProgress = (step: string) => {
      currentStep++;
      const progress = { step, progress: currentStep, total: totalSteps };
      onProgress?.(progress);
      return progress;
    };

    try {
      // Step 1: Get full movie details
      updateProgress('Fetching movie details...');
      const movieDetails = await this.tmdbService.getMovieDetails(tmdbMovie.id);

      // Step 2: Get movie credits (actors, directors, writers)
      updateProgress('Fetching movie credits...');
      const credits: TMDbCredits = await this.tmdbService.getMovieCredits(tmdbMovie.id);

      // Step 3: Enrich cast (actors) with detailed profiles
      updateProgress('Enriching actor profiles...');
      const actors = await this.enrichCastMembers(credits.cast?.slice(0, 10) || []); // Limit to top 10 actors

      // Step 4: Enrich crew (directors, writers) with detailed profiles  
      updateProgress('Enriching crew profiles...');
      const directors = await this.enrichCrewMembers(
        credits.crew?.filter((member: TMDbCrewMember) => member.job === 'Director') || []
      );
      const writers = await this.enrichCrewMembers(
        credits.crew?.filter((member: TMDbCrewMember) => 
          member.job === 'Writer' || 
          member.job === 'Screenplay' || 
          member.job === 'Story'
        ) || []
      );

      // Step 5: Process genres
      updateProgress('Processing genres...');
      const genres = this.processGenres(movieDetails.genres || []);

      // Step 6: Process production companies (studios)
      updateProgress('Processing studios...');
      const studios = await this.processStudios(
        movieDetails.production_companies?.map(company => ({
          id: company.id,
          name: company.name,
          logo_path: company.logo_path || null,
          origin_country: company.headquarters || ''
        })) || []
      );

      // Step 7: Process countries
      updateProgress('Processing countries...');
      const countries = this.processCountries(movieDetails.production_countries || []);

      // Step 8: Process languages
      updateProgress('Processing languages...');
      const languages = this.processLanguages(movieDetails.spoken_languages || []);

      const finalProgress = updateProgress('Enrichment complete!');

      return {
        movie: movieDetails,
        actors,
        directors,
        writers,
        genres,
        studios,
        countries,
        languages,
        enrichmentProgress: finalProgress
      };

    } catch (error) {
      console.error('Movie enrichment failed:', error);
      throw new Error(`Failed to enrich movie data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Enrich cast members with detailed profiles from TMDb
   */
  private async enrichCastMembers(cast: TMDbCastMember[]): Promise<EnrichedActor[]> {
    const enrichedActors: EnrichedActor[] = [];

    for (const actor of cast) {
      try {
        // Get detailed actor profile
        const actorDetails = await this.tmdbService.getPersonDetails(actor.id);
        
        enrichedActors.push({
          tmdb_id: actor.id,
          name: actor.name,
          character: actor.character,
          profile_path: actor.profile_path || undefined,
          biography: actorDetails.biography,
          birthday: actorDetails.birthday,
          deathday: actorDetails.deathday,
          place_of_birth: actorDetails.place_of_birth,
          profile_image_url: actor.profile_path ? 
            this.tmdbService.getImageUrl(actor.profile_path, 'w300') : undefined
        });
      } catch (error) {
        console.warn(`Failed to enrich actor ${actor.name}:`, error);
        // Add basic info even if detailed fetch fails
        enrichedActors.push({
          tmdb_id: actor.id,
          name: actor.name,
          character: actor.character,
          profile_path: actor.profile_path || undefined,
          profile_image_url: actor.profile_path ? 
            this.tmdbService.getImageUrl(actor.profile_path, 'w300') : undefined
        });
      }
    }

    return enrichedActors;
  }

  /**
   * Enrich crew members (directors, writers) with detailed profiles
   */
  private async enrichCrewMembers(crew: TMDbCrewMember[]): Promise<EnrichedDirector[]> {
    const enrichedCrew: EnrichedDirector[] = [];

    // Remove duplicates by person ID
    const uniqueCrew = crew.reduce((acc: TMDbCrewMember[], member: TMDbCrewMember) => {
      if (!acc.find((existing: TMDbCrewMember) => existing.id === member.id)) {
        acc.push(member);
      }
      return acc;
    }, []);

    for (const member of uniqueCrew) {
      try {
        // Get detailed person profile
        const personDetails = await this.tmdbService.getPersonDetails(member.id);
        
        enrichedCrew.push({
          tmdb_id: member.id,
          name: member.name,
          profile_path: member.profile_path || undefined,
          biography: personDetails.biography,
          birthday: personDetails.birthday,
          deathday: personDetails.deathday,
          place_of_birth: personDetails.place_of_birth,
          profile_image_url: member.profile_path ? 
            this.tmdbService.getImageUrl(member.profile_path, 'w300') : undefined
        });
      } catch (error) {
        console.warn(`Failed to enrich crew member ${member.name}:`, error);
        // Add basic info even if detailed fetch fails
        enrichedCrew.push({
          tmdb_id: member.id,
          name: member.name,
          profile_path: member.profile_path || undefined,
          profile_image_url: member.profile_path ? 
            this.tmdbService.getImageUrl(member.profile_path, 'w300') : undefined
        });
      }
    }

    return enrichedCrew;
  }

  /**
   * Process genres into enriched format
   */
  private processGenres(genres: TMDbGenre[]): EnrichedGenre[] {
    return genres.map(genre => ({
      tmdb_id: genre.id,
      name: genre.name
    }));
  }

  /**
   * Process production companies into enriched studios
   */
  private async processStudios(companies: TMDbProductionCompany[]): Promise<EnrichedStudio[]> {
    const enrichedStudios: EnrichedStudio[] = [];

    for (const company of companies) {
      try {
        // For now, use basic company data. Could be enhanced with company details API if needed
        enrichedStudios.push({
          tmdb_id: company.id,
          name: company.name,
          logo_path: company.logo_path || undefined,
          origin_country: company.origin_country
        });
      } catch (error) {
        console.warn(`Failed to process studio ${company.name}:`, error);
        enrichedStudios.push({
          tmdb_id: company.id,
          name: company.name,
          logo_path: company.logo_path || undefined,
          origin_country: company.origin_country
        });
      }
    }

    return enrichedStudios;
  }

  /**
   * Process production countries
   */
  private processCountries(countries: TMDbProductionCountry[]): EnrichedCountry[] {
    return countries.map(country => ({
      iso_3166_1: country.iso_3166_1,
      name: country.name
    }));
  }

  /**
   * Process spoken languages
   */
  private processLanguages(languages: TMDbSpokenLanguage[]): EnrichedLanguage[] {
    return languages.map(language => ({
      iso_639_1: language.iso_639_1,
      name: language.name,
      english_name: language.english_name
    }));
  }

  /**
   * Create or update all WordPress entities for the enriched movie
   */
  async createWordPressEntities(
    enrichedData: EnrichedMovieData,
    onProgress?: (progress: { step: string; progress: number; total: number }) => void
  ): Promise<{
    movieId: number;
    createdEntities: {
      actors: number[];
      directors: number[];
      writers: number[];
      genres: number[];
      studios: number[];
      countries: number[];
      languages: number[];
    };
  }> {
    const totalSteps = 8;
    let currentStep = 0;

    const updateProgress = (step: string) => {
      currentStep++;
      const progress = { step, progress: currentStep, total: totalSteps };
      onProgress?.(progress);
      return progress;
    };

    const createdEntities = {
      actors: [] as number[],
      directors: [] as number[],
      writers: [] as number[],
      genres: [] as number[],
      studios: [] as number[],
      countries: [] as number[],
      languages: [] as number[]
    };

    try {
      // Step 1: Create or update actors
      updateProgress('Creating actor entities...');
      createdEntities.actors = await this.createActorEntities(enrichedData.actors);

      // Step 2: Create or update directors
      updateProgress('Creating director entities...');
      createdEntities.directors = await this.createDirectorEntities(enrichedData.directors);

      // Step 3: Create or update writers
      updateProgress('Creating writer entities...');
      createdEntities.writers = await this.createWriterEntities(enrichedData.writers);

      // Step 4: Create or update genres
      updateProgress('Creating genre entities...');
      createdEntities.genres = await this.createGenreEntities(enrichedData.genres);

      // Step 5: Create or update studios
      updateProgress('Creating studio entities...');
      createdEntities.studios = await this.createStudioEntities(enrichedData.studios);

      // Step 6: Create or update countries
      updateProgress('Creating country entities...');
      createdEntities.countries = await this.createCountryEntities(enrichedData.countries);

      // Step 7: Create or update languages
      updateProgress('Creating language entities...');
      createdEntities.languages = await this.createLanguageEntities(enrichedData.languages);

      // Step 8: Create the movie with all relationships
      updateProgress('Creating movie entity with relationships...');
      const movieId = await this.createMovieEntity(enrichedData, createdEntities);

      updateProgress('All entities created successfully!');

      return {
        movieId,
        createdEntities
      };

    } catch (error) {
      console.error('Failed to create WordPress entities:', error);
      throw new Error(`Failed to create WordPress entities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create or update actor entities in WordPress
   */
  private async createActorEntities(actors: EnrichedActor[]): Promise<number[]> {
    const actorIds: number[] = [];

    for (const actor of actors) {
      try {
        // Check if actor already exists by TMDb ID or name
        const existingActor = await this.findExistingEntity('actor', actor.tmdb_id, actor.name);
        
        if (existingActor) {
          actorIds.push(existingActor.id);
          continue;
        }

        // Upload profile image if available
        let profileImageId: number | undefined;
        if (actor.profile_image_url) {
          try {
            const filename = `actor-${actor.tmdb_id}-profile.jpg`;
            const uploadResult = await this.wordPressService.uploadImageFromUrl(actor.profile_image_url, filename);
            profileImageId = uploadResult.thumbnail.id;
          } catch (error) {
            console.warn(`Failed to upload profile image for actor ${actor.name}:`, error);
          }
        }

        // Create actor entity
        const actorData = {
          title: actor.name,
          status: 'publish',
          meta: {
            actor_name: actor.name,
            actor_biography: actor.biography || '',
            actor_birthday: actor.birthday || '',
            actor_deathday: actor.deathday || '',
            actor_place_of_birth: actor.place_of_birth || '',
            actor_tmdb_id: actor.tmdb_id.toString(),
            actor_tmdb_url: `https://www.themoviedb.org/person/${actor.tmdb_id}`,
            profile_image: profileImageId || ''
          }
        };

        const createdActor = await this.wordPressService.createPost('actors', actorData);
        actorIds.push(createdActor.id);

      } catch (error) {
        console.warn(`Failed to create actor ${actor.name}:`, error);
        // Continue with other actors instead of failing completely
      }
    }

    return actorIds;
  }

  /**
   * Create or update director entities in WordPress
   */
  private async createDirectorEntities(directors: EnrichedDirector[]): Promise<number[]> {
    const directorIds: number[] = [];

    for (const director of directors) {
      try {
        // Check if director already exists
        const existingDirector = await this.findExistingEntity('director', director.tmdb_id, director.name);
        
        if (existingDirector) {
          directorIds.push(existingDirector.id);
          continue;
        }

        // Upload profile image if available
        let profileImageId: number | undefined;
        if (director.profile_image_url) {
          try {
            const filename = `director-${director.tmdb_id}-profile.jpg`;
            const uploadResult = await this.wordPressService.uploadImageFromUrl(director.profile_image_url, filename);
            profileImageId = uploadResult.thumbnail.id;
          } catch (error) {
            console.warn(`Failed to upload profile image for director ${director.name}:`, error);
          }
        }

        // Create director entity
        const directorData = {
          title: director.name,
          status: 'publish',
          meta: {
            director_name: director.name,
            director_biography: director.biography || '',
            director_birthday: director.birthday || '',
            director_deathday: director.deathday || '',
            director_place_of_birth: director.place_of_birth || '',
            director_tmdb_id: director.tmdb_id.toString(),
            director_tmdb_url: `https://www.themoviedb.org/person/${director.tmdb_id}`,
            profile_image: profileImageId || ''
          }
        };

        const createdDirector = await this.wordPressService.createPost('directors', directorData);
        directorIds.push(createdDirector.id);

      } catch (error) {
        console.warn(`Failed to create director ${director.name}:`, error);
      }
    }

    return directorIds;
  }

  /**
   * Create or update writer entities in WordPress
   */
  private async createWriterEntities(writers: EnrichedWriter[]): Promise<number[]> {
    const writerIds: number[] = [];

    for (const writer of writers) {
      try {
        // Check if writer already exists
        const existingWriter = await this.findExistingEntity('writer', writer.tmdb_id, writer.name);
        
        if (existingWriter) {
          writerIds.push(existingWriter.id);
          continue;
        }

        // Upload profile image if available
        let profileImageId: number | undefined;
        if (writer.profile_image_url) {
          try {
            const filename = `writer-${writer.tmdb_id}-profile.jpg`;
            const uploadResult = await this.wordPressService.uploadImageFromUrl(writer.profile_image_url, filename);
            profileImageId = uploadResult.thumbnail.id;
          } catch (error) {
            console.warn(`Failed to upload profile image for writer ${writer.name}:`, error);
          }
        }

        // Create writer entity
        const writerData = {
          title: writer.name,
          status: 'publish',
          meta: {
            writer_name: writer.name,
            writer_biography: writer.biography || '',
            writer_birthday: writer.birthday || '',
            writer_deathday: writer.deathday || '',
            writer_place_of_birth: writer.place_of_birth || '',
            writer_tmdb_id: writer.tmdb_id.toString(),
            writer_tmdb_url: `https://www.themoviedb.org/person/${writer.tmdb_id}`,
            profile_image: profileImageId || ''
          }
        };

        const createdWriter = await this.wordPressService.createPost('writers', writerData);
        writerIds.push(createdWriter.id);

      } catch (error) {
        console.warn(`Failed to create writer ${writer.name}:`, error);
      }
    }

    return writerIds;
  }

  /**
   * Create or update genre entities in WordPress
   */
  private async createGenreEntities(genres: EnrichedGenre[]): Promise<number[]> {
    const genreIds: number[] = [];

    for (const genre of genres) {
      try {
        // Check if genre already exists
        const existingGenre = await this.findExistingEntity('genre', genre.tmdb_id, genre.name);
        
        if (existingGenre) {
          genreIds.push(existingGenre.id);
          continue;
        }

        // Create genre entity
        const genreData = {
          title: genre.name,
          status: 'publish',
          meta: {
            genre_name: genre.name,
            genre_tmdb_id: genre.tmdb_id.toString()
          }
        };

        const createdGenre = await this.wordPressService.createPost('genres', genreData);
        genreIds.push(createdGenre.id);

      } catch (error) {
        console.warn(`Failed to create genre ${genre.name}:`, error);
      }
    }

    return genreIds;
  }

  /**
   * Create or update studio entities in WordPress
   */
  private async createStudioEntities(studios: EnrichedStudio[]): Promise<number[]> {
    const studioIds: number[] = [];

    for (const studio of studios) {
      try {
        // Check if studio already exists
        const existingStudio = await this.findExistingEntity('studio', studio.tmdb_id, studio.name);
        
        if (existingStudio) {
          studioIds.push(existingStudio.id);
          continue;
        }

        // Upload logo if available
        let logoImageId: number | undefined;
        if (studio.logo_path) {
          try {
            const logoUrl = this.tmdbService.getImageUrl(studio.logo_path, 'w300');
            const filename = `studio-${studio.tmdb_id}-logo.png`;
            const uploadResult = await this.wordPressService.uploadImageFromUrl(logoUrl, filename);
            logoImageId = uploadResult.thumbnail.id;
          } catch (error) {
            console.warn(`Failed to upload logo for studio ${studio.name}:`, error);
          }
        }

        // Create studio entity
        const studioData = {
          title: studio.name,
          status: 'publish',
          meta: {
            studio_name: studio.name,
            studio_tmdb_id: studio.tmdb_id.toString(),
            studio_origin_country: studio.origin_country || '',
            studio_logo: logoImageId || ''
          }
        };

        const createdStudio = await this.wordPressService.createPost('studios', studioData);
        studioIds.push(createdStudio.id);

      } catch (error) {
        console.warn(`Failed to create studio ${studio.name}:`, error);
      }
    }

    return studioIds;
  }

  /**
   * Create or update country entities in WordPress
   */
  private async createCountryEntities(countries: EnrichedCountry[]): Promise<number[]> {
    const countryIds: number[] = [];

    for (const country of countries) {
      try {
        // Check if country already exists by ISO code or name
        const existingCountry = await this.findExistingEntity('country', country.iso_3166_1, country.name);
        
        if (existingCountry) {
          countryIds.push(existingCountry.id);
          continue;
        }

        // Create country entity
        const countryData = {
          title: country.name,
          status: 'publish',
          meta: {
            country_name: country.name,
            country_iso_code: country.iso_3166_1
          }
        };

        const createdCountry = await this.wordPressService.createPost('countries', countryData);
        countryIds.push(createdCountry.id);

      } catch (error) {
        console.warn(`Failed to create country ${country.name}:`, error);
      }
    }

    return countryIds;
  }

  /**
   * Create or update language entities in WordPress
   */
  private async createLanguageEntities(languages: EnrichedLanguage[]): Promise<number[]> {
    const languageIds: number[] = [];

    for (const language of languages) {
      try {
        // Check if language already exists by ISO code or name
        const existingLanguage = await this.findExistingEntity('language', language.iso_639_1, language.name);
        
        if (existingLanguage) {
          languageIds.push(existingLanguage.id);
          continue;
        }

        // Create language entity
        const languageData = {
          title: language.english_name,
          status: 'publish',
          meta: {
            language_name: language.name,
            language_english_name: language.english_name,
            language_iso_code: language.iso_639_1
          }
        };

        const createdLanguage = await this.wordPressService.createPost('languages', languageData);
        languageIds.push(createdLanguage.id);

      } catch (error) {
        console.warn(`Failed to create language ${language.name}:`, error);
      }
    }

    return languageIds;
  }

  /**
   * Create the movie entity with all relationships established
   */
  private async createMovieEntity(
    enrichedData: EnrichedMovieData,
    relatedEntities: {
      actors: number[];
      directors: number[];
      writers: number[];
      genres: number[];
      studios: number[];
      countries: number[];
      languages: number[];
    }
  ): Promise<number> {
    const movie = enrichedData.movie;

    // Upload poster and backdrop images
    let posterImageId: number | undefined;
    let backdropImageId: number | undefined;

    if (movie.poster_path) {
      try {
        const posterUrl = this.tmdbService.getImageUrl(movie.poster_path, 'w500');
        const filename = `movie-${movie.id}-poster.jpg`;
        const uploadResult = await this.wordPressService.uploadImageFromUrl(posterUrl, filename);
        posterImageId = uploadResult.thumbnail.id;
      } catch (error) {
        console.warn(`Failed to upload poster for movie ${movie.title}:`, error);
      }
    }

    if (movie.backdrop_path) {
      try {
        const backdropUrl = this.tmdbService.getImageUrl(movie.backdrop_path, 'w1280');
        const filename = `movie-${movie.id}-backdrop.jpg`;
        const uploadResult = await this.wordPressService.uploadImageFromUrl(backdropUrl, filename);
        backdropImageId = uploadResult.thumbnail.id;
      } catch (error) {
        console.warn(`Failed to upload backdrop for movie ${movie.title}:`, error);
      }
    }

    // Create character names array from actors with characters (filter out undefined values)
    const characters = enrichedData.actors
      .filter(actor => actor.character)
      .map(actor => actor.character!);

    // Create movie entity with all relationships
    const movieData = {
      title: movie.title,
      status: 'publish',
      featured_media: posterImageId,
      meta: {
        movie_title: movie.title,
        movie_original_title: movie.original_title,
        movie_year: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : '',
        movie_release_date: movie.release_date,
        movie_runtime: movie.runtime || 0,
        movie_tagline: movie.tagline || '',
        movie_overview: movie.overview || '',
        movie_budget: movie.budget ? movie.budget.toString() : '',
        movie_box_office: movie.revenue ? movie.revenue.toString() : '',
        movie_poster: posterImageId || '',
        movie_backdrop: backdropImageId || '',
        movie_tmdb_id: movie.id.toString(),
        movie_tmdb_url: `https://www.themoviedb.org/movie/${movie.id}`,
        movie_tmdb_rating: movie.vote_average ? movie.vote_average.toString() : '',
        movie_tmdb_votes: movie.vote_count ? movie.vote_count.toString() : '',
        movie_imdb_id: movie.imdb_id || '',
        movie_imdb_url: movie.imdb_id ? `https://www.imdb.com/title/${movie.imdb_id}` : '',
        movie_characters: characters,
        // Relationship fields
        movie_actors: relatedEntities.actors,
        movie_directors: relatedEntities.directors,
        movie_writers: relatedEntities.writers,
        movie_genres: relatedEntities.genres,
        movie_studios: relatedEntities.studios,
        movie_countries: relatedEntities.countries,
        movie_languages: relatedEntities.languages
      }
    };

    const createdMovie = await this.wordPressService.createPost('movies', movieData);
    return createdMovie.id;
  }

  /**
   * Find existing entity by TMDb ID or name
   */
  private async findExistingEntity(
    entityType: string,
    _identifier: string | number,
    _name: string
  ): Promise<{ id: number } | null> {
    try {
      // This would search for existing entities by TMDb ID or name
      // For now, we'll assume entities don't exist and always create new ones
      // This can be optimized later with proper search functionality using the WordPress service:
      // const results = await this.wordPressService.searchPostsByMeta(entityType, 'tmdb_id', identifier);
      // return results.length > 0 ? results[0] : null;
      console.log(`Checking for existing ${entityType}...`);
      return null;
    } catch (error) {
      console.warn(`Error checking for existing ${entityType}:`, error);
      return null;
    }
  }
}

export default MovieEnrichmentService;
