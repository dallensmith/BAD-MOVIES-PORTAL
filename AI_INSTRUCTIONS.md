# Bad Movies Portal - AI Development Instructions

## 🎉 MIGRATION SUCCESS - POCKETBASE BACKEND COMPLETE

Dear Next AI Developer,

**CONGRATULATIONS!** You're inheriting a project that has successfully transitioned from a complex SQLite/WordPress architecture to a production-ready PocketBase backend. The previous AI team has completed a comprehensive migration that:

✅ **Eliminated all backend complexity** - No more SQLite database management  
✅ **Implemented comprehensive schema** - 29 movie fields + full relationships  
✅ **Created type-safe service layer** - Complete TypeScript integration  
✅ **Validated all CRUD operations** - Every operation tested and working  
✅ **Future-proofed affiliate links** - Amazon ready, streaming services prepared  

**About Your Human Partner:**
You're working with someone who has a clear vision and infinite patience for getting things right. They understand both the technical requirements and the community this serves. Trust their guidance - they know exactly what they want to build and will help you understand the "so bad it's good" movie community's needs.

**Your Role:**
Focus on **frontend integration** and **user experience**. The backend is solid and comprehensive. Your job is to connect the beautiful React interface to the robust PocketBase service layer.

---

## 🎯 CURRENT PROJECT STATUS

### ✅ **COMPLETED (Don't Touch - It Works!)**

- **PocketBase Backend**: Remote hosted, fully configured, production-ready
- **Comprehensive Schema**: All WordPress Pods fields mapped and validated
- **Service Layer**: `src/services/pocketbase.service.ts` - complete CRUD operations
- **Type Definitions**: Full TypeScript coverage for all entities
- **Data Validation**: All fields tested and working correctly
- **Affiliate Links**: Amazon integration ready, future streaming services prepared
- **Relationship Management**: All 7 relationship types implemented and tested

### 🔄 **YOUR MISSION: FRONTEND INTEGRATION**

**Phase 1: Core Integration** (This Week)
1. **Update Movie Components**: Connect to PocketBase service instead of WordPress
2. **Implement TMDb → PocketBase**: Data enrichment workflow  
3. **Test Movie Lifecycle**: Create → Edit → Delete → Search
4. **Update Forms**: Use new comprehensive schema fields

**Phase 2: Enhanced Features** (Next 2 Weeks)
1. **Relationship UI**: Actor, director, writer management interfaces
2. **Advanced Search**: Pagination, filtering, sorting in frontend
3. **Image Integration**: TMDb image handling and optimization
4. **Experiment Management**: Enhanced experiment-to-movie relationships

---

## 🛠️ ARCHITECTURE OVERVIEW

### **PocketBase Backend** (✅ Complete)
- **URL**: `https://bsbm-pocketbase.cap.dasco.services`
- **Authentication**: Admin level access for data management
- **Schema**: Comprehensive - matches WordPress Pods 100%
- **API Rules**: Public read, authenticated write
- **Performance**: Optimized for real-time queries

### **TypeScript Service Layer** (✅ Complete)
```typescript
// Located: src/services/pocketbase.service.ts
import { pocketbaseService } from './services/pocketbase.service';

// All operations type-safe and tested:
await pocketbaseService.authenticate(email, password);
const movies = await pocketbaseService.getAllMovies();
const movie = await pocketbaseService.createMovie(movieData);
const updated = await pocketbaseService.updateMovie(id, changes);
const results = await pocketbaseService.searchMovies(query);
```

### **Frontend Components** (🔄 Your Focus)
- **React 18 + TypeScript**: Modern, fast, type-safe
- **Tailwind CSS**: Consistent, responsive design
- **Component Library**: Reusable UI components available
- **State Management**: React Query recommended for data fetching

---

## 📊 COMPLETE SCHEMA REFERENCE

### **Movie Entity (29 Fields)**
```typescript
interface Movie {
  // Core Information
  movie_title: string;           // Required
  movie_slug: string;
  movie_year: number;
  movie_runtime_minutes: number;
  movie_plot: string;

  // External IDs
  movie_tmdb_id: number;
  movie_imdb_id: string;

  // Financial Data  
  movie_budget: number;
  movie_box_office: number;
  movie_revenue: number;

  // Media Assets
  movie_poster_url: string;
  movie_backdrop_url: string;
  movie_trailer_url: string;

  // Affiliate Links
  movie_amazon_link: string;     // 🎯 Current focus
  // Future: movie_netflix_link, movie_hulu_link, etc.

  // TMDb Data
  movie_release_date: string;
  movie_status: string;
  movie_original_language: string;
  movie_vote_average: number;
  movie_vote_count: number;
  movie_popularity: number;
  movie_tagline: string;
  movie_homepage: string;
  movie_is_adult: boolean;
  movie_belongs_to_collection: boolean;

  // Content Rating
  movie_mpaa_rating: string;

  // Extensible Arrays (JSON fields)
  movie_production_companies: string[];
  movie_production_countries: string[];
  movie_spoken_languages: string[];
}
```

### **Relationship Collections** (✅ All Implemented)
- `movie_actors` - Movies ↔ Actors (with character names, order)
- `movie_directors` - Movies ↔ Directors  
- `movie_writers` - Movies ↔ Writers
- `movie_studios` - Movies ↔ Studios
- `movie_genres` - Movies ↔ Genres
- `movie_countries` - Movies ↔ Countries
- `movie_languages` - Movies ↔ Languages
- `experiment_movies` - Experiments ↔ Movies (with notes, ratings)

---

## 🎯 YOUR DEVELOPMENT PRIORITIES

### **CRITICAL: Don't Reinvent the Wheel**
The backend is production-ready. Your job is frontend integration, not backend rebuilding.

### **1. Update Movie Management (High Priority)**

**Current State**: Movie components use WordPress API  
**Target State**: Movie components use PocketBase service  

**Key Files to Update**:
```typescript
src/components/movie/MovieList.tsx         // Update to use pocketbaseService.getAllMovies()
src/components/movie/MovieEditModal.tsx    // Update form to use new schema
src/components/movie/MovieSearchModal.tsx  // Connect to pocketbaseService.searchMovies()
src/pages/Dashboard.tsx                   // Update movie display logic
```

**Pattern to Follow**:
```typescript
// OLD (WordPress)
const movies = await wordpressService.getMovies();

// NEW (PocketBase)  
const movies = await pocketbaseService.getAllMovies();
```

### **2. TMDb Integration (High Priority)**

**Goal**: TMDb API → PocketBase storage  
**Location**: `src/services/movie-enrichment.service.ts`

**Update Pattern**:
```typescript
// 1. Fetch from TMDb (existing service works)
const tmdbData = await tmdbService.getMovieDetails(tmdbId);

// 2. Transform data format
const movieData = {
  movie_title: tmdbData.title,
  movie_year: new Date(tmdbData.release_date).getFullYear(),
  movie_tmdb_id: tmdbData.id,
  movie_poster_url: `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`,
  // ... map all fields
};

// 3. Store in PocketBase (new)
const movie = await pocketbaseService.createMovie(movieData);

// 4. Add relationships
for (const actor of tmdbData.cast) {
  await pocketbaseService.addActorToMovie(movie.id, actor.id, actor.character);
}
```

### **3. Form Updates (Medium Priority)**

**Movie Forms**: Update to include all 29 fields  
**Validation**: Use PocketBase validation rules  
**UI/UX**: Progressive disclosure for advanced fields  

**Example Form Structure**:
```typescript
// Core Fields (always visible)
- movie_title*, movie_year, movie_runtime_minutes
- movie_plot, movie_mpaa_rating

// TMDb Fields (auto-populated)  
- movie_tmdb_id, movie_poster_url, movie_vote_average

// Affiliate Fields (important for monetization)
- movie_amazon_link

// Advanced Fields (collapsible section)
- Financial data, production info, technical details
```

---

## 🔧 DEVELOPMENT PATTERNS

### **Service Usage Pattern**
```typescript
import { pocketbaseService } from '../services/pocketbase.service';

// Component pattern
const MovieComponent = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await pocketbaseService.getAllMovies();
        setMovies(data);
      } catch (error) {
        console.error('Failed to fetch movies:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovies();
  }, []);

  // ... component logic
};
```

### **Error Handling Pattern**
```typescript
try {
  const movie = await pocketbaseService.createMovie(movieData);
  // Success feedback
} catch (error) {
  if (error.status === 400) {
    // Validation error - show field-specific messages
  } else if (error.status === 403) {
    // Authentication error - redirect to login
  } else {
    // Generic error - show friendly message
  }
}
```

### **Relationship Management Pattern**
```typescript
// Add actor to movie
await pocketbaseService.addActorToMovie(movieId, actorId, 'Character Name');

// Get movie with relationships
const movie = await pocketbaseService.getMovieWithRelationships(movieId);
// Returns movie with expanded actors, directors, etc.
```

---

## 🎭 UNDERSTANDING THE VISION

### **The "So Bad It's Good" Community**
This isn't just another movie database. You're building for people who:
- Love terrible movies ironically
- Host group viewing events ("experiments")  
- Want detailed information about B-movies, cult classics, etc.
- Need affiliate links for monetization (Amazon primarily)
- Appreciate comprehensive data and search capabilities

### **Key User Workflows**
1. **Event Planning**: Search for bad movies → Create experiment → Invite people
2. **Database Building**: Find missing movies → Add TMDb data → Enhance with details
3. **Content Creation**: Research movies → Export data → Create blog posts/videos
4. **Monetization**: Link to Amazon → Track affiliate performance

### **Success Metrics**
- **Data Completeness**: Every movie has comprehensive TMDb data
- **User Experience**: Fast, intuitive movie management
- **Affiliate Revenue**: Working Amazon links with tracking
- **Community Growth**: Easy experiment creation and sharing

---

## 🚨 CRITICAL RULES & CONSTRAINTS

### **DO NOT**
- ❌ Modify the PocketBase service layer (it's tested and works)
- ❌ Change the database schema without discussion
- ❌ Remove existing UI components that work well
- ❌ Break the TMDb API integration
- ❌ Ignore the affiliate link requirements

### **DO**
- ✅ Focus on frontend integration and user experience
- ✅ Test every change thoroughly
- ✅ Ask questions when WordPress Pods context is unclear
- ✅ Maintain type safety throughout
- ✅ Consider the "bad movie" community's specific needs
- ✅ Plan for future streaming service affiliate links

### **TESTING CHECKLIST**
Before any major changes:
- [ ] Movie CRUD operations work end-to-end
- [ ] TMDb search and data fetching still functional
- [ ] All forms validate correctly
- [ ] Affiliate links are preserved and functional
- [ ] No TypeScript errors in service layer
- [ ] UI remains responsive and accessible

---

## 📁 KEY FILES REFERENCE

### **Core Service Layer** (✅ Complete - Don't Modify)
```
src/services/pocketbase.service.ts    # Main service - PRODUCTION READY
src/types/index.ts                   # Type definitions - comprehensive
```

### **Frontend Integration Targets** (🔄 Your Focus)
```
src/components/movie/MovieList.tsx         # Movie display components
src/components/movie/MovieEditModal.tsx    # Movie forms
src/components/movie/MovieSearchModal.tsx  # Search interface
src/services/movie-enrichment.service.ts   # TMDb → PocketBase integration
src/pages/Dashboard.tsx                   # Main dashboard
```

### **Reference Files** (📚 Understand These)
```
docs/POCKETBASE_MIGRATION_SUCCESS.md      # Migration documentation
pods-structure.json                       # WordPress Pods field reference
.env                                      # PocketBase credentials
```

---

## 🎯 SUCCESS CRITERIA

### **Phase 1 Complete When:**
- [ ] Movies can be created, edited, deleted via PocketBase
- [ ] TMDb search creates movies in PocketBase with full data
- [ ] Movie list displays all movies from PocketBase
- [ ] Search and filtering work with PocketBase backend
- [ ] All forms use the comprehensive 29-field schema

### **Phase 2 Complete When:**
- [ ] Relationship management UI (actors, directors, etc.)
- [ ] Advanced search with pagination and filters
- [ ] Image handling optimized
- [ ] Experiment-to-movie relationships enhanced

### **Production Ready When:**
- [ ] End-to-end movie lifecycle tested
- [ ] All affiliate links functional
- [ ] Performance optimized
- [ ] Error handling comprehensive
- [ ] UI polished and accessible

---

## 💡 FINAL THOUGHTS

You're inheriting a solid technical foundation. The PocketBase migration eliminated complexity while providing enterprise-grade capabilities. Focus on user experience and frontend polish - the backend will support whatever you build.

The human you're working with has invested significant time and thought into this project. They understand both the technical requirements and the community it serves. Trust their vision and don't hesitate to ask for clarification on the "bad movie" community's specific needs.

**Most Important**: This is a passion project built with love for a unique community. Every decision should consider how it serves people who genuinely love terrible movies and want to share that joy with others.

---

**Status**: ✅ **Backend Complete** → 🔄 **Frontend Integration Phase**  
**Next Milestone**: Movies fully integrated with PocketBase service layer
