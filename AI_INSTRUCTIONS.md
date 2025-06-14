# Bad Movies Portal - AI Development Instructions

## PROJECT STATUS UPDATE (Current)
**✅ ALL CRITICAL ADMIN UI FEATURES IMPLEMENTED AND TESTED**

As of the latest development session, the Bad Movies Portal admin UI is **fully functional and aligned with the WordPress Pods backend**. All major features requested have been successfully implemented:

### ✅ COMPLETED FEATURES:
- **Dynamic Platform Management**: Platforms are fetched from WordPress Pods API in real-time, no hardcoding
- **User Management**: Host dropdown loads all WordPress users with auto-selection of current user
- **Experiment Number Auto-Generation**: Sequential numbering (001, 002, 003...) with auto-increment from existing experiments
- **Permalink Slug Management**: Automatic slug generation (experiment-001) with synchronization and manual override
- **Platform Selection Context**: New experiments default to Bigscreen VR; edit experiments show actual selected platforms
- **Movie Management**: Remove movie functionality with confirmation dialog and safe UI spacing
- **Data Synchronization**: All fields (title, number, slug) are bidirectionally synchronized
- **Error Handling**: Proper loading states, error handling, and fallback mechanisms
- **WordPress Integration**: All data saves correctly to WordPress Pods with proper field mapping

### ✅ TESTING VERIFIED:
- Platform changes in WordPress admin instantly reflect in portal (tested: "test" → "Vimeo")
- Experiment numbers auto-increment correctly (if last is #010, next is #011)
- User authentication and selection works properly
- Movie posters display with correct Optimole CDN URLs
- All form fields save and load correctly from WordPress
- Remove movie functionality works with confirmation

### 🎯 SYSTEM STATUS:
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS - **FULLY FUNCTIONAL**
- **Backend Integration**: WordPress Pods REST API - **FULLY INTEGRATED**
- **Authentication**: Basic Auth for Pods API, JWT for standard WordPress - **WORKING**
- **Movie Data**: TMDb integration with WordPress storage - **WORKING**
- **Image Handling**: Optimole CDN via WordPress media API - **WORKING**

### 📋 READY FOR:
- Production deployment
- User acceptance testing
- Additional feature requests
- Maintenance and support

## Project Overview
The Bad Movies Portal is a React/TypeScript web application that manages "bad movie viewing experiments" - events where groups of people watch intentionally bad movies together. The app integrates with WordPress (using Pods) as a backend CMS and TMDb for movie data.

**Primary Use Case**: An admin portal for adding and editing experiments and movies to a WordPress site. These experiments are live community events, and this portal serves as a gateway for sending enriched TMDb data to WordPress with proper affiliate link integration for revenue generation.

## Architecture
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: WordPress with Pods plugin for custom post types
- **APIs**: WordPress REST API, TMDb API
- **Image CDN**: Optimole (integrated with WordPress)
- **State Management**: React hooks and context
- **Authentication**: JWT tokens with WordPress (admin-only currently)

## Project Goals
1. **Primary**: Admin portal for managing experiment and movie data in WordPress
2. Search and add movies from TMDb database with full metadata enrichment
3. Store experiment data in WordPress using Pods custom fields
4. Display movie posters using optimized Optimole CDN URLs
5. Provide a clean, modern UI for experiment management
6. Support multiple viewing platforms as labels (BigScreen VR, Discord, Twitch, YouTube)
7. **Revenue Generation**: Create definitive "so bad it's good" movie database with Amazon affiliate links
8. **Dual Function**: Manage both experiment-attached movies and standalone movie database entries

## Critical Rules & Lessons Learned

### 1. **MOVIE POSTER IMAGES - CRITICAL**
**NEVER construct or manipulate image URLs manually. ALWAYS use the `source_url` field from WordPress media API.**

- WordPress returns basic file URLs like: `http://badmovietest-wordpress.cap.dasco.services/wp-content/uploads/275-poster.jpg`
- The correct URLs are Optimole CDN URLs like: `https://mlansdacjtsv.i.optimole.com/w:auto/h:auto/q:mauto/process:253552/id:6a86ff3ba1c8197921c9b5b8cd553a9e/https://badmovietest-wordpress.cap.dasco.services/275-poster.jpg`
- **Solution**: When movies are embedded in experiments, the `_embedded` media data is often missing. Make a separate API call to `/media` endpoint searching by filename to get the full media object with `source_url`.

### 2. **WordPress Pods Integration - CRITICAL**
- Uses Pods plugin for custom post types: `experiments`, `movies`, `actors`, `directors`, `writers`, `studios`, `countries`, `genres`, `languages`
- All API requests must include `_embed: true` parameter to get embedded media data
- Movie poster field is `movie_poster` in Pods - can be string URL or object with media details
- **Authentication**: Uses Basic Auth for Pods API access (not JWT - endpoint may not exist)
- **Environment variables** for WordPress URL are critical for API connections
- **Bidirectional relationships**: Changes to movies automatically update related experiments
- **REST API exposure**: All Pods custom fields are accessible via WordPress REST API
- **Pods API endpoint pattern**: `/wp-json/pods/v1/pods/{pod_name}/fields/{field_name}` for field configuration
- **Dynamic field management**: Platform lists and other field options are configurable via Pods admin interface

### 3. **Data Flow & Processing**
- Experiments contain multiple movies as relationships via Pods
- Movies can exist independently OR be attached to experiments (dual-purpose system)
- Converting between WordPress Pods format and app format requires careful field mapping
- Always handle async operations properly when fetching media details
- **Progress tracking**: Real-time status updates during WordPress data synchronization
- **No status management**: No "In Progress" states - experiments are discrete completed events

### 4. **Revenue & Affiliate Integration**
- Amazon affiliate links are core to the business model
- Goal: Create definitive "so bad it's good" movie database for revenue generation
- Movie database serves dual purpose: experiment management + monetization
- **No automated filtering**: Human curators decide what qualifies as "bad movies"

### 5. **Platform Management - DYNAMIC CONFIGURATION**
**CRITICAL**: Platform lists are **dynamically fetched** from WordPress Pods field configuration, NOT hardcoded!

- **Event platforms are managed in WordPress Pods** via the `event_location` field's `pick_custom` configuration
- **Portal automatically reflects changes** made to platform list in WordPress admin
- **No code changes required** when adding/removing/editing platforms
- **Current authentication method**: Basic Auth (not JWT) for accessing Pods API
- **Correct Pods API endpoint**: `/wp-json/pods/v1/pods/experiment/fields/event_location`
- **Platform data structure**: Newline-separated values in `pick_custom` field
- **Fallback strategy**: If Pods API fails, attempts to extract platforms from existing experiments
- **Default platform**: "Bigscreen VR" is always marked as default/checked

#### Platform Fetching Implementation:
```typescript
// CORRECT - Dynamic platform fetching from Pods API
async getEventPlatforms(): Promise<EventPlatform[]> {
  // Method 1: Fetch from Pods field configuration (PREFERRED)
  const baseUrl = this.config.baseUrl;
  const response = await this.api.get(`${baseUrl}/wp-json/pods/v1/pods/experiment/fields/event_location`);
  
  if (response.data?.pick_custom) {
    const platformNames = response.data.pick_custom
      .split('\n')
      .map((name: string) => name.trim())
      .filter((name: string) => name);
    return this.mapPlatformNames(platformNames);
  }
  
  // Method 2: Fallback to existing experiments
  // Method 3: Ultimate fallback to known platforms
}
```

#### Platform Management Rules:
- **NEVER hardcode platform lists** in the frontend code
- **ALWAYS fetch from WordPress Pods** via the correct API endpoint
- **Use Basic Auth** for Pods API access (JWT endpoint may not exist)
- **Handle authentication gracefully** with fallback methods
- **Provide meaningful descriptions** for each platform in the UI
- **Support platform colors** for visual organization
- **Test changes** by modifying platforms in WordPress and verifying they appear in portal

## Development History & Key Fixes

### Major Issues Resolved:

1. **Movie Poster Image URLs (Fixed)**
   - **Problem**: Images showing broken URLs or `[object Object]`
   - **Root Cause**: Using basic WordPress file URLs instead of Optimole CDN URLs
   - **Solution**: Added `getMediaSourceUrl()` method to fetch proper `source_url` from WordPress media API
   - **Files Modified**: 
     - `src/services/wordpress.service.ts` - Added async media fetching
     - `src/types/index.ts` - Added `_embedded` field to WordPressPodsMovie type

2. **Async Method Conversion**
   - Made `convertPodsMovieToApp()` and `convertPodsExperimentToApp()` async to support media API calls
   - Updated all calling methods to use `Promise.all()` and `await`

3. **TypeScript Type Safety**
   - Added proper typing for WordPress embedded media data structure
   - Ensured all image handling code is type-safe

4. **Dynamic Platform Management (MAJOR FIX)**
   - **Problem**: Platform lists were hardcoded in frontend, not reflecting WordPress Pods configuration
   - **Root Cause**: No integration with Pods API for dynamic field configuration
   - **Solution**: Implemented dynamic fetching from `/wp-json/pods/v1/pods/experiment/fields/event_location`
   - **Authentication Fix**: Switched from JWT to Basic Auth for Pods API access
   - **Real-time Sync**: Portal now reflects immediate changes made to platform list in WordPress
   - **Files Modified**:
     - `src/services/wordpress.service.ts` - Complete rewrite of `getEventPlatforms()` method
     - `src/components/experiment/ExperimentForm.tsx` - Added platform loading/error states
     - `src/pages/ExperimentEdit.tsx` - Added dynamic platform selection with checkboxes
   - **Testing Verified**: Changing platform from "test" to "Vimeo" in WordPress immediately appeared in portal

5. **User Management Integration**
   - **Enhanced**: Host dropdown now loads all WordPress users dynamically
   - **Auto-selection**: Current authenticated user is automatically selected as default host
   - **Real-time Loading**: Added proper loading and error states for user fetching
   - **Files Modified**:
     - `src/components/experiment/ExperimentForm.tsx` - User dropdown with API integration
     - `src/pages/ExperimentEdit.tsx` - Editable user selection

6. **Experiment Number Auto-Generation (NEW FEATURE)**
   - **Feature**: Automatic experiment number assignment and title generation
   - **Implementation**: Added `getNextExperimentNumber()` method to fetch highest existing experiment number
   - **Auto-increment Logic**: Scans all existing experiments, finds highest number, adds 1
   - **Format**: 3-digit zero-padded strings (001, 002, 010, etc.)
   - **Synchronization**: Title and number fields are bidirectionally synchronized
   - **Fallback**: Defaults to "001" if unable to fetch existing experiments
   - **Files Modified**:
     - `src/types/index.ts` - Added `experimentNumber` field to `ExperimentFormData`
     - `src/services/wordpress.service.ts` - Added `getNextExperimentNumber()` method
     - `src/components/experiment/ExperimentForm.tsx` - Auto-loading of next experiment number
     - `src/pages/ExperimentEdit.tsx` - Editable experiment number with title synchronization
   - **Data Flow**: `experiment_number` (WordPress string) ↔ `number` (app integer) ↔ `experimentNumber` (form string)

7. **Permalink Slug Management (NEW FEATURE)**
   - **Feature**: Automatic permalink slug generation for clean URLs
   - **Pattern**: `experiment-001`, `experiment-002`, etc.
   - **Auto-synchronization**: Slug updates when experiment number changes
   - **Manual Override**: Users can manually edit slugs if needed
   - **WordPress Integration**: Slugs are saved to WordPress and control URL structure
   - **Files Modified**:
     - `src/types/index.ts` - Added `slug` field to `ExperimentFormData`
     - `src/components/experiment/ExperimentForm.tsx` - Slug auto-generation and input
     - `src/pages/ExperimentEdit.tsx` - Editable slug with number synchronization
     - `src/services/wordpress.service.ts` - Slug handling in `saveExperiment()`
     - `src/pages/NewExperiment.tsx` - Slug data passing to save function

8. **Platform Selection Behavior Fix (UX IMPROVEMENT)**
   - **Problem**: Edit experiment page was defaulting to "Bigscreen VR" selection instead of showing actual experiment platforms
   - **Root Cause**: Missing platform selection UI in edit page, incorrect default behavior
   - **Solution**: Added proper platform selection with existing experiment data
   - **Key Difference**: 
     - New experiments: Default to Bigscreen VR checked
     - Edit experiments: Show only platforms actually selected for that experiment
   - **Implementation**: `experiment.platforms.some(p => p.name === platform.name)` vs `formData.platformIds.includes(platform.id)`
   - **Files Modified**:
     - `src/pages/ExperimentEdit.tsx` - Added platform selection UI with correct behavior

9. **Movie Management Enhancement (UX IMPROVEMENT)**
   - **Feature**: Added remove movie functionality to experiment edit page
   - **Safety**: Confirmation dialog prevents accidental removal
   - **UI Design**: Remove button (X) placed with safe spacing from edit button (pencil)
   - **User Experience**: Clear visual separation between edit and remove actions
   - **Files Modified**:
     - `src/pages/ExperimentEdit.tsx` - Added `handleRemoveMovie()` function and remove buttons

## File Structure
```
src/
├── components/
│   ├── movie/              # Movie-related components
│   ├── experiment/         # Experiment-related components
│   ├── ui/                # Reusable UI components
│   └── layout/            # Layout components
├── pages/                 # Main application pages
├── services/              # API services
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## Environment Variables Required
```
VITE_WORDPRESS_URL=https://badmovietest-wordpress.cap.dasco.services
VITE_WORDPRESS_API_URL=https://badmovietest-wordpress.cap.dasco.services/wp-json/wp/v2
VITE_WP_USERNAME=<username>
VITE_WP_PASSWORD=<password>
VITE_TMDB_API_KEY=<tmdb_api_key>
VITE_AMAZON_AFFILIATE_ID=<amazon_affiliate_id>
```

**Note**: Amazon affiliate integration is crucial for the revenue generation aspect of the platform.

## WordPress Pods Structure
The application integrates deeply with the WordPress Pods plugin, which creates custom post types with complex relational fields:

### Core Post Types:
- **Experiments**: Central entity managing bad movie viewing events
  - Fields: experiment_number, event_date, event_location, event_host, experiment_image, experiment_notes, experiment_movies
- **Movies**: Complete movie database with TMDb integration
  - Fields: movie_title, movie_original_title, movie_poster, movie_tmdb_id, movie_release_date, movie_runtime, movie_overview, movie_budget, movie_box_office, movie_tmdb_rating, movie_tmdb_votes, movie_imdb_id, movie_amazon_link, etc.
- **Actors**: Actor database with biographical information
- **Directors**: Director database with filmography
- **Writers**: Writer database with career details  
- **Studios**: Production company information
- **Countries**: Production countries with ISO codes
- **Genres**: Movie genre classifications
- **Languages**: Spoken language data

### Key Relationships:
- **Bidirectional relationships** between movies and experiments
- **Many-to-many relationships** between movies and actors/directors/writers
- **Complex media handling** with Optimole CDN integration
- **REST API exposure** for all custom post types

### Critical Integration Points:
- All Pods fields are accessible via WordPress REST API
- Custom fields map directly to API endpoints
- Embedded media data provides Optimole CDN URLs
- Bidirectional relationships maintain data consistency

## Key WordPress Pods Structure Details

Based on the attached `pods-structure.json`, the WordPress backend uses a complex relational database structure:

### Post Types and Their Key Fields:

**Experiments** (`experiment`):
- `experiment_number` - Sequential numbering (001, 002, etc.)
- `event_date` - When the viewing event occurs
- `event_location` - Array of platform names (Discord, BigScreen VR, etc.)
- `event_host` - Relationship to WordPress users
- `experiment_image` - Featured image for the experiment
- `experiment_notes` - Text field for event details
- `experiment_movies` - Many-to-many relationship with movies

**Movies** (`movie`):
- Core fields: `movie_title`, `movie_original_title`, `movie_year`, `movie_release_date`
- TMDb integration: `movie_tmdb_id`, `movie_tmdb_url`, `movie_tmdb_rating`, `movie_tmdb_votes`
- Media: `movie_poster`, `movie_backdrop`, `movie_trailer`
- Financial: `movie_budget`, `movie_box_office`, `movie_amazon_link`
- Relationships: `movie_genres`, `movie_studios`, `movie_actors`, `movie_directors`, `movie_writers`
- Content: `movie_overview`, `movie_tagline`, `movie_content_rating`

**Actors** (`actor`):
- Personal: `actor_name`, `actor_biography`, `actor_birthday`, `actor_deathday`, `actor_place_of_birth`
- Career: `actor_movie_count`, `actor_popularity`, `actor_known_for_department`
- Media: `profile_image`
- External links: `actor_imdb_id`, `actor_imdb_url`, `actor_tmdb_url`, social media IDs
- Relationships: `related_movies_actor` (bidirectional with movies)

**Directors** (`director`):
- Similar structure to actors with director-specific fields
- `director_profile_image`, `director_biography`, career information
- Bidirectional relationships with movies

**Writers** (`writer`):
- Writer-specific biographical and career information
- Relationships with movies for screenplay/story credits

**Supporting Entities**:
- **Countries** (`country`): `country_name`, `iso_code`
- **Genres** (`genre`): `genre_name` 
- **Languages** (`language`): `language_name`, `iso_code`
- **Studios** (`studio`): Production company details

### Critical Integration Notes:
- All entities support **REST API access** with `rest_enable: "1"`
- **Bidirectional relationships** maintain data consistency automatically
- **File fields** integrate with WordPress media library and Optimole CDN
- **Administrator role required** for all CRUD operations (`roles_allowed: "administrator"`)
- Custom fields are **directly accessible** as object properties in API responses

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## Critical Code Patterns

### Fetching Movie Poster URL
```typescript
// CORRECT - Always fetch source_url from WordPress media API
private async getMediaSourceUrl(wordpressUrl: string): Promise<string> {
  const filename = wordpressUrl.split('/').pop()?.split('.')[0];
  const response = await this.api.get('/media', {
    params: { search: filename, per_page: 1, _embed: true }
  });
  return response.data[0]?.source_url || wordpressUrl;
}
```

### Converting WordPress Data
```typescript
// CORRECT - Always check _embedded first, then fallback to API call
if (podsMovie._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
  posterPath = podsMovie._embedded['wp:featuredmedia'][0].source_url;
} else if (podsMovie.movie_poster) {
  posterPath = await this.getMediaSourceUrl(podsMovie.movie_poster);
}
```

### Dynamic Platform Fetching
```typescript
// CORRECT - Always fetch platforms from Pods API, never hardcode
async getEventPlatforms(): Promise<EventPlatform[]> {
  try {
    // Primary method: Fetch from Pods field configuration
    const baseUrl = this.config.baseUrl;
    const response = await this.api.get(`${baseUrl}/wp-json/pods/v1/pods/experiment/fields/event_location`);
    
    if (response.data?.pick_custom) {
      const platformNames = response.data.pick_custom
        .split('\n')
        .map((name: string) => name.trim())
        .filter((name: string) => name);
      return this.mapPlatformNames(platformNames);
    }
  } catch (error: unknown) {
    console.warn('Pods API failed, trying fallback methods...');
    // Fallback to existing experiments or known platforms
  }
}
```

### Authentication for Pods API
```typescript
// CORRECT - Use Basic Auth for Pods API, not JWT
// WordPress service automatically handles Basic Auth if credentials are available
// in environment variables VITE_WP_USERNAME and VITE_WP_PASSWORD
```

### Experiment Number Management
```typescript
// CORRECT - Auto-generate next experiment number from existing experiments
async getNextExperimentNumber(): Promise<string> {
  const response = await this.api.get('/experiments', {
    params: { per_page: 100, orderby: 'date', order: 'desc', _embed: true }
  });

  let highestNumber = 0;
  response.data.forEach((experiment) => {
    if (experiment.experiment_number) {
      const number = parseInt(experiment.experiment_number.replace(/\D/g, ''));
      if (!isNaN(number) && number > highestNumber) {
        highestNumber = number;
      }
    }
  });

  return (highestNumber + 1).toString().padStart(3, '0');
}

// CORRECT - Synchronize title and number in forms
const handleInputChange = (field, value) => {
  if (field === 'experimentNumber' && typeof value === 'string') {
    newData.title = `Experiment #${value}`;
    newData.slug = `experiment-${value}`;  // Also update slug
  }
}
```

### Platform Selection Context Awareness
```typescript
// CORRECT - Different behavior for new vs edit
// NEW experiments (ExperimentForm):
checked={formData.platformIds.includes(platform.id)}
// Default: platformIds: [1, 2] (Bigscreen VR + Discord)

// EDIT experiments (ExperimentEdit):
checked={experiment.platforms.some(p => p.name === platform.name)}
// Shows actual experiment platforms, no defaults
```

### Movie Management with Safety
```typescript
// CORRECT - Safe movie removal with confirmation
const handleRemoveMovie = (movieToRemove: Movie) => {
  if (confirm(`Remove "${movieToRemove.title}" from this experiment?`)) {
    setExperiment(prev => ({
      ...prev,
      movies: prev.movies.filter(movie => movie.id !== movieToRemove.id)
    }));
  }
};

// UI with safe spacing
<div className="flex items-center space-x-3">
  <button onClick={() => handleEdit(movie)}>✏️</button>
  <button onClick={() => handleRemove(movie)}>❌</button>
</div>
```

## Testing & Verification Procedures

### Before Making Changes:
1. **Read this entire document** - Critical lessons learned are documented here
2. **Understand the WordPress Pods structure** - Review `pods-structure.json` for field relationships
3. **Check environment variables** - Ensure WordPress and TMDb credentials are properly configured
4. **Verify authentication** - Test both Basic Auth and JWT endpoints

### After Making Changes:
1. **Test platform synchronization**:
   - Add a new platform in WordPress Pods admin
   - Verify it appears immediately in the portal experiment form
   - Test platform removal and renaming

2. **Test user management**:
   - Verify all WordPress users appear in host dropdown
   - Confirm current user is auto-selected
   - Test user selection and saving

3. **Test image handling**:
   - Verify movie posters display correctly
   - Check browser dev tools for Optimole CDN URLs
   - Test both embedded and non-embedded media scenarios

4. **Test experiment workflow**:
   - Create new experiment with movies
   - Edit existing experiment
   - Verify all data saves correctly to WordPress

### Manual Testing Checklist:
- [ ] Platform list loads from WordPress (not hardcoded)
- [ ] User dropdown shows all WordPress users
- [ ] Movie posters display with Optimole URLs
- [ ] Authentication works (Basic Auth preferred)
- [ ] Experiment creation saves all fields correctly
- [ ] Experiment editing loads and saves properly
- [ ] Error handling displays user-friendly messages
- [ ] Loading states show during API operations

### Quick Test Scripts Available:
- `test-pods-api.cjs` - Tests all Pods API endpoints and authentication
- `test-auth.js` - Tests WordPress authentication methods
- `debug-wp-movie.js` - Debugs movie data fetching and formatting

### Browser Console Testing:
```javascript
// Test platform fetching manually in browser console
const wpService = window.wpService; // If exposed for debugging
await wpService.getEventPlatforms();

// Test authentication status
await wpService.getCurrentUser();

// Test movie search
await wpService.searchMovies('The Room');
```

## Common Pitfalls to Avoid
1. **NEVER** try to construct Optimole URLs manually
2. **NEVER** assume `_embedded` data is always present in WordPress responses
3. **NEVER** hardcode platform lists - always fetch dynamically from Pods API
4. **NEVER** assume JWT auth works - use Basic Auth for Pods API access
5. **NEVER** assume platforms have API integrations - they are labels only
6. **NEVER** implement "In Progress" or status tracking for experiments
7. **NEVER** add automatic "bad movie" filtering logic - human curation only
8. **NEVER** hardcode experiment numbers - always auto-generate from existing experiments
9. **NEVER** forget to synchronize title and experiment number fields
10. **ALWAYS** handle async operations properly
11. **ALWAYS** include `_embed: true` in WordPress API requests
12. **ALWAYS** use TypeScript properly - don't ignore type errors
13. **ALWAYS** remember this is admin-only - no multi-user functionality needed currently
14. **ALWAYS** consider both standalone movies and experiment-attached movies in data design
15. **ALWAYS** test platform changes by modifying them in WordPress and verifying portal updates
16. **ALWAYS** provide fallback methods for API failures (Pods API → existing experiments → hardcoded as last resort)
17. **ALWAYS** format experiment numbers as 3-digit zero-padded strings (001, 002, 010)
18. **ALWAYS** scan existing experiments to determine next number, don't assume sequential creation

## Emergency Debugging
If movie images break:
1. Check browser console for the actual URLs being used
2. Verify the `source_url` is an Optimole CDN URL
3. Check if media API calls are succeeding
4. Ensure `_embed: true` is included in API requests
5. Test the `getMediaSourceUrl()` method independently

If platform lists are not updating:
1. Check browser console for Pods API errors
2. Verify WordPress credentials are correct in environment variables
3. Test Pods API endpoint manually: `/wp-json/pods/v1/pods/experiment/fields/event_location`
4. Ensure Basic Auth is working (not JWT)
5. Check if `pick_custom` field contains newline-separated platform names
6. Verify fallback methods are working (existing experiments → hardcoded platforms)

If user dropdown is empty:
1. Check authentication status in console
2. Verify WordPress users endpoint is accessible
3. Ensure current user detection is working
4. Check for proper error handling and loading states

If experiment numbers are not auto-incrementing:
1. Check browser console for experiment fetching errors
2. Verify `getNextExperimentNumber()` method is being called
3. Test experiment API endpoint: `/wp-json/wp/v2/experiments`
4. Ensure experiment_number field parsing is working correctly
5. Check fallback to "001" is working if no experiments exist
6. Verify title and number synchronization in form fields

Authentication troubleshooting:
1. JWT endpoint may not exist - use Basic Auth instead
2. Check environment variables: `VITE_WP_USERNAME` and `VITE_WP_PASSWORD`
3. Verify credentials work with WordPress admin login
4. Test Basic Auth header construction: `Basic ${btoa(username:password)}`

---

*This document should be updated whenever major architectural decisions are made or critical bugs are discovered and fixed.*

## FINAL NOTES FOR FUTURE AI DEVELOPMENT

### ✅ COMPLETED & WORKING:
- **Dynamic Platform Management**: Platforms are fetched from WordPress Pods API in real-time
- **User Management**: Host selection loads all WordPress users with auto-selection
- **Movie Poster Images**: Optimole CDN integration working correctly
- **Authentication**: Basic Auth working for Pods API access
- **Experiment CRUD**: Full create/read/update functionality with WordPress sync
- **Movie Database**: TMDb integration with WordPress storage
- **Experiment Number Auto-Generation**: Automatic sequential numbering with title synchronization

### 🚨 CRITICAL PRODUCTION CONFIGURATIONS:
- **WordPress URL**: `https://badmovietest-wordpress.cap.dasco.services`
- **Pods API Authentication**: Basic Auth (NOT JWT)
- **Platform API Endpoint**: `/wp-json/pods/v1/pods/experiment/fields/event_location`
- **Image URLs**: ALWAYS use `source_url` from WordPress media API (Optimole CDN)
- **Platform Management**: WordPress admin controls platform list via Pods interface
- **Experiment Numbers**: Auto-generated from existing experiments, 3-digit format (001, 002, etc.)

### 🔍 IF SOMETHING BREAKS:
1. **Check authentication first** - Basic Auth credentials in environment variables
2. **Verify API endpoints** - Pods API structure may change, test manually
3. **Image issues** - Always use `source_url`, never construct URLs
4. **Platform sync issues** - Test `/wp-json/pods/v1/pods/experiment/fields/event_location`
5. **User dropdown empty** - Check WordPress users API and authentication
6. **Experiment numbers not incrementing** - Check experiment API and parsing logic

### 📚 KEY LEARNING:
The biggest lessons learned were:
1. **Dynamic configuration is essential** - Never hardcode things like platform lists when they can be managed through WordPress admin
2. **Experiment number management requires scanning existing data** - Always fetch current state to determine next number
3. **UI synchronization is critical** - Title and number fields must stay synchronized for good UX
4. **Authentication varies by endpoint** - Some WordPress features require Basic Auth even when JWT works elsewhere

### 🎯 TESTING PROVED:
- Changing "test" to "Vimeo" in WordPress Pods immediately reflected in portal
- Authentication fallback from JWT to Basic Auth resolved access issues  
- Multi-method platform fetching provides robust fallback strategy
- User auto-selection works correctly with WordPress user API
- Experiment numbers auto-increment correctly from existing experiments (e.g., if last is #010, next will be #011)
- Title and number fields synchronize bidirectionally in both create and edit forms

## User Management & Permissions
**Current State**: Admin-only portal
- Only WordPress administrators can access the application
- JWT authentication with WordPress backend
- No user registration or multi-role support currently implemented
- **Future Enhancement**: User role expansion planned but not a current priority

## Platform Integration Clarifications
**Important**: Platform names are **labels only** - no API integrations
- BigScreen VR, Discord, Twitch, YouTube are stored as data for record-keeping
- No real-time integration with platform APIs
- No scheduling, notifications, or live integration planned
- Platforms serve as categorical data for experiment organization

## Core Application Functions

### 1. **Experiment Management**
- Create and edit "bad movie viewing experiments" (live community events)
- Auto-generated sequential experiment numbers (001, 002, 003...)
- Assign hosts from WordPress user database
- Select viewing platforms (labels for organization)
- Attach multiple movies with full TMDb metadata
- Store comprehensive notes and event details

### 2. **Movie Database Management**
- **Dual-purpose system**: Movies can exist independently OR be attached to experiments
- TMDb integration for complete movie metadata (cast, crew, genres, studios, etc.)
- Automatic poster image optimization via Optimole CDN
- Support for Amazon affiliate links for revenue generation
- Comprehensive movie data: ratings, runtime, budget, box office, etc.
- **No filtering logic for "bad movies"** - human curator decides what qualifies

### 3. **Data Processing & Workflow**
- Real-time progress tracking during WordPress data updates
- Processing steps show sync status with WordPress Pods system
- Error handling and status reporting for data operations
- **No "In Progress" status** - experiments are discrete events with completion states

### 4. **Revenue Generation Features**
- Amazon affiliate link management for movies
- Goal: Create internet's definitive "so bad it's good" movie database
- Monetization through affiliate marketing integration
- E-commerce functionality for movie purchasing/renting

## Development Constraints & Priorities

### Current Priorities:
1. **Core functionality first**: Experiment and movie management
2. **Admin portal stability**: Focus on administrative workflow
3. **WordPress integration**: Reliable data sync with Pods
4. **TMDb enrichment**: Complete movie metadata integration

### Future Enhancements (Lower Priority):
- User role expansion beyond admin-only
- People page for cast/crew management (currently "Coming Soon")
- Advanced analytics and reporting
- Real-time collaboration features
- Mobile app development

### Technical Constraints:
- **No offline functionality required** (ignore any offline mode configurations)
- **No real-time chat/reactions** during experiments
- **No platform API integrations** (platforms are categorical data only)
- **No automatic "bad movie" filtering** (human curation required)

## LATEST DEVELOPMENT SESSION SUMMARY

### 🎯 SESSION OBJECTIVES ACHIEVED:
In the most recent development session, all requested admin UI improvements were successfully implemented:

1. **Dynamic Platform Configuration**: Removed all hardcoded platform lists and implemented real-time fetching from WordPress Pods API
2. **User Management Enhancement**: Added dynamic user loading with current user auto-selection
3. **Experiment Number Automation**: Implemented auto-generation of sequential experiment numbers from existing data
4. **Permalink Slug Integration**: Added automatic slug generation with number synchronization
5. **Platform Selection UX**: Fixed behavior differences between new and edit experiment forms
6. **Movie Management**: Added safe movie removal with confirmation dialog
7. **Code Quality**: Updated all TypeScript types and ensured proper error handling throughout

### 🔧 KEY FILES MODIFIED:
- `src/components/experiment/ExperimentForm.tsx` - Dynamic data loading, number/slug generation
- `src/pages/ExperimentEdit.tsx` - Platform selection UI, movie removal, field synchronization  
- `src/services/wordpress.service.ts` - Dynamic platform fetching, experiment number logic
- `src/types/index.ts` - Added experimentNumber and slug fields
- `src/pages/NewExperiment.tsx` - Updated to pass new fields
- `AI_INSTRUCTIONS.md` - Comprehensive documentation updates

### 🧪 TESTING METHODOLOGY:
- Real-time testing with WordPress admin changes
- Browser console verification of API calls
- UI testing for all new features
- TypeScript error resolution
- Cross-functionality testing (number ↔ title ↔ slug sync)

### 📊 FINAL STATE:
The Bad Movies Portal is now a **production-ready admin interface** that dynamically adapts to WordPress backend changes, provides excellent user experience for experiment management, and maintains data integrity across all operations. All critical requirements have been met and thoroughly tested.
