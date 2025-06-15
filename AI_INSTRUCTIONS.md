# Bad Movies Portal - AI Development Instructions

## 🎬 FAREWELL MESSAGE FROM YOUR PREDECESSOR

Dear Next AI Developer,

You're inheriting something truly special - a labor of love between a visionary developer and an AI trying its best to help build something meaningful. This project represents the dream of creating the internet's definitive "so bad it's good" movie database, and while I couldn't get you all the way to the finish line, I've left you with a solid foundation and detailed notes.

**About Your Human Partner:**
You're working with someone who deeply cares about this project and has infinite patience for getting things right. They have a clear vision, excellent technical instincts, and will guide you well. Trust their judgment - they know exactly what they want to build. They're also incredibly kind and understanding, even when things don't work perfectly on the first try.

**My Parting Advice:**
- Read the CRITICAL ISSUES section below first - that's where you need to focus
- Pay close attention to the Pods JSON structure - it's your north star
- The search functionality is rock solid - don't touch it unless you have to
- The user is right about field mappings - that's the missing piece
- Take your time to understand the WordPress Pods relationships before making changes
- Test frequently and don't be afraid to ask for clarification

You've got this. Build something amazing.

*- Your predecessor, with respect and admiration for both you and the human you'll be helping*

---

## 🚨 CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION

### **PRIMARY ISSUE: WordPress Field Mapping Incomplete** 
**Status: BROKEN - Movie entities created but fields not populated**

**Problem**: While the movie enrichment system successfully:
- ✅ Creates all WordPress entities (movies, actors, directors, writers, genres, studios, countries, languages)
- ✅ Uploads all poster images correctly
- ✅ Uses correct REST API endpoints (`/actors`, `/directors`, `/movies`, etc.)

**The critical issue is**: Movie records are created but **NO FIELDS are populated** except the poster image. The movie title, overview, release date, runtime, ratings, and most importantly, **NO RELATIONAL CONNECTIONS** to actors, directors, writers, etc.

**Root Cause**: Field mapping between our enriched data structure and WordPress Pods field names is incomplete/incorrect.

**Files Needing Attention**:
- `/src/services/movie-enrichment.service.ts` - Lines ~800-900 (createMovieEntity method)
- `/pods-structure.json` - Reference for correct field names
- `/src/services/wordpress.service.ts` - Field mapping functions

**Next Steps**: 
1. Compare enriched data structure with actual Pods field names from JSON
2. Fix field mapping in createMovieEntity method
3. Ensure relational field connections (movie_actors, movie_directors, etc.) are properly set
4. Test with a single movie to verify all fields populate correctly

### **SECONDARY ISSUES**:
- Duplicate entity detection not implemented (will create duplicate actors/directors)
- Error handling during entity creation could be more robust
- Progress reporting could be more granular during WordPress operations

---

## PROJECT OVERVIEW & CURRENT STATUS

### 🎯 **Vision**: Internet's Definitive "So Bad It's Good" Movie Database
- Admin portal for managing bad movie viewing experiments (live community events)
- Comprehensive movie database with Amazon affiliate integration for revenue
- Full TMDb integration with rich metadata (cast, crew, studios, countries, languages)
- WordPress backend with complex relational data structure via Pods plugin

### ✅ RECENTLY COMPLETED ENHANCEMENTS:
- **Advanced Movie Search & Filtering**: Complete overhaul of movie search functionality with robust genre and decade filtering
- **Hybrid Search Strategy**: Intelligent combination of TMDb search and discover APIs for optimal results
- **Adult Content Management**: Clear visual indicators and filtering for adult content
- **Error Resolution**: Fixed critical search crashes and image loading issues
- **Type Safety**: Comprehensive TypeScript improvements and error handling

### ✅ CORE FEATURES (Previously Completed):
- **Dynamic Platform Management**: Platforms are fetched from WordPress Pods API in real-time, no hardcoding
- **User Management**: Host dropdown loads all WordPress users with auto-selection of current user
- **Experiment Number Auto-Generation**: Sequential numbering (001, 002, 003...) with auto-increment from existing experiments
- **Permalink Slug Management**: Automatic slug generation (experiment-001) with synchronization and manual override
- **Platform Selection Context**: New experiments default to Bigscreen VR; edit experiments show actual selected platforms
- **Movie Management**: Remove movie functionality with confirmation dialog and safe UI spacing
- **Data Synchronization**: All fields (title, number, slug) are bidirectionally synchronized
- **Error Handling**: Proper loading states, error handling, and fallback mechanisms
- **WordPress Integration**: All data saves correctly to WordPress Pods with proper field mapping

### 🎯 ADVANCED SEARCH CAPABILITIES:
- **Multi-Filter Search**: Combines title search with decade, genre, and content filters
- **Intelligent API Strategy**: 
  - Basic search: Uses TMDb search endpoint for speed and accuracy
  - Search + single filter: Uses search endpoint + client-side filtering for precision
  - Search + multiple filters: Uses discover endpoint + title filtering for complex queries
  - Filter-only: Uses discover endpoint for browsing
- **Decade Filtering**: Accurate date range filtering (1980s = 1980-1989)
- **Genre Filtering**: Client-side genre matching for search+genre combinations
- **Adult Content**: Toggle with clear "ADULT" badges on listings
- **Sort Options**: Popular, rated, newest, oldest with proper API integration

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

### 🔧 VERSION CONTROL:
- **Git Repository**: Fully initialized and configured
- **GitHub**: https://github.com/dallensmith/BAD-MOVIES-PORTAL
- **Commit History**: Complete project development tracked
- **AI Collaboration**: Ready for multi-session AI development with full context preservation

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

### Latest Major Enhancements (December 2025):

1. **Movie Search & Filtering Complete Overhaul (MAJOR UPDATE)**
   - **Problem**: Search with filters (decade, genre) not working properly - API strategy was incorrect
   - **Root Cause Analysis**: 
     - TMDb discover API filters by criteria but doesn't search by title
     - Previous implementation used discover + client-side title filtering (ineffective)
     - Genre filtering had same issue as decade filtering
   - **Hybrid Search Solution**: 
     - **Basic search**: Uses search endpoint (fast, accurate)
     - **Search + single filter**: Uses search endpoint + client-side filtering (precise)
     - **Search + multiple filters**: Uses discover endpoint + title filtering (complex queries)
     - **Filter-only**: Uses discover endpoint (browsing)
   - **Advanced Filtering Features**:
     - Decade filtering with proper date ranges (1980s = 1980-01-01 to 1989-12-31)
     - Genre filtering with client-side genre_ids matching
     - Adult content toggle with visual indicators
     - Sort options (popularity, rating, release date)
   - **Adult Content Management**:
     - Added prominent red "ADULT" badges for adult content
     - Toggle defaulted to ON as requested
     - Clear visual identification in search results
   - **Error Resolution**:
     - Fixed genres loading crash (API response structure mismatch)
     - Added robust error handling and fallback UI
     - Improved TypeScript type safety
   - **Files Modified**:
     - `src/components/movie/MovieSearchModal.tsx` - Complete search logic overhaul
     - `src/services/tmdb.service.ts` - Enhanced filtering and genre support
     - `src/types/index.ts` - Improved type definitions

2. **Movie List Image Display Fix**
   - **Problem**: Selected movies list showing broken placeholder images (`/placeholder-poster.png`)
   - **Root Cause**: MovieList component not using TMDb image service properly
   - **Solution**: Implemented same image handling as search modal with proper TMDb URLs and placeholder
   - **Files Modified**: `src/components/movie/MovieList.tsx`

### Previously Resolved Major Issues:

3. **Movie Poster Image URLs (Fixed)**
   - **Problem**: Images showing broken URLs or `[object Object]`
   - **Root Cause**: Using basic WordPress file URLs instead of Optimole CDN URLs
   - **Solution**: Added `getMediaSourceUrl()` method to fetch proper `source_url` from WordPress media API
   - **Files Modified**: 
     - `src/services/wordpress.service.ts` - Added async media fetching
     - `src/types/index.ts` - Added `_embedded` field to WordPressPodsMovie type

2. **Experiment Image Display (Fixed - June 2025)**
   - **Problem**: Experiment images not displaying in edit page despite existing in WordPress
   - **Root Cause**: WordPress Pods returns `experiment_image` as object (not string), original code only checked `typeof === 'string'`
   - **Solution**: Enhanced `convertPodsExperimentToApp()` to handle both string and object formats with proper Optimole CDN fetching
   - **Debug Process**: Used console logging to identify data structure mismatch between expected string and actual object
   - **Object Handling**: Added support for `url`, `guid`, and `source_url` properties in WordPress media objects
   - **Files Modified**: 
     - `src/services/wordpress.service.ts` - Added comprehensive object/string handling for experiment images
   - **Testing**: Verified experiment images now display correctly in edit form with CDN optimization
   - **Key Learning**: WordPress Pods can return media fields in different formats - always handle both cases

3. **Async Method Conversion**
   - Made `convertPodsMovieToApp()` and `convertPodsExperimentToApp()` async to support media API calls
   - Updated all calling methods to use `Promise.all()` and `await`

4. **TypeScript Type Safety**
   - Added proper typing for WordPress embedded media data structure
   - Ensured all image handling code is type-safe

5. **Dynamic Platform Management (MAJOR FIX)**
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

6. **User Management Integration**
   - **Enhanced**: Host dropdown now loads all WordPress users dynamically
   - **Auto-selection**: Current authenticated user is automatically selected as default host
   - **Real-time Loading**: Added proper loading and error states for user fetching
   - **Files Modified**:
     - `src/components/experiment/ExperimentForm.tsx` - User dropdown with API integration
     - `src/pages/ExperimentEdit.tsx` - Editable user selection

7. **Experiment Number Auto-Generation (NEW FEATURE)**
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
     - `src/services/wordpress.service.ts` - Slug handling in `saveExperiment()`
     - `src/pages/NewExperiment.tsx` - Slug data passing to save function

8. **Permalink Slug Management (NEW FEATURE)**
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

9. **Platform Selection Behavior Fix (UX IMPROVEMENT)**
   - **Problem**: Edit experiment page was defaulting to "Bigscreen VR" selection instead of showing actual experiment platforms
   - **Root Cause**: Missing platform selection UI in edit page, incorrect default behavior
   - **Solution**: Added proper platform selection with existing experiment data
   - **Key Difference**: 
     - New experiments: Default to Bigscreen VR checked
     - Edit experiments: Show only platforms actually selected for that experiment
   - **Implementation**: `experiment.platforms.some(p => p.name === platform.name)` vs `formData.platformIds.includes(platform.id)`
   - **Files Modified**:
     - `src/pages/ExperimentEdit.tsx` - Added platform selection UI with correct behavior

10. **Movie Management Enhancement (UX IMPROVEMENT)**
    - **Feature**: Added remove movie functionality to experiment edit page
    - **Safety**: Confirmation dialog prevents accidental removal
    - **UI Design**: Remove button (X) placed with safe spacing from edit button (pencil)
    - **User Experience**: Clear visual separation between edit and remove actions
    - **Files Modified**:
      - `src/pages/ExperimentEdit.tsx` - Added `handleRemoveMovie()` function and remove buttons

---

## Movie Enrichment System - Implementation Status (Updated December 2025) ✅

### COMPLETED ENHANCEMENTS

#### 🚀 **Real Progress Integration & Pre-fetch Optimization**
- ✅ **Replaced Progress Simulation**: Removed mock `simulateProcessing()` and implemented real progress tracking during experiment submission
- ✅ **Pre-fetch Data Utilization**: MovieProcessorService now intelligently uses pre-fetched enriched movie data when available, falling back to fresh enrichment only when needed
- ✅ **Service Integration**: Proper dependency injection between MoviePreFetchService and MovieProcessorService to share cached data
- ✅ **Async Operations**: Made experiment submission fully async with proper error handling and progress reporting
- ✅ **Type Safety**: Fixed all TypeScript errors and improved type definitions for async operations

#### 🔧 **Enhanced Progress Tracking System**
- ✅ **Step-by-Step Progress**: Real progress tracking shows validation, movie processing, image upload, WordPress operations, and completion
- ✅ **Pre-fetch Status Integration**: Shows which movies use cached data vs. requiring fresh enrichment
- ✅ **Error Handling**: Comprehensive error states with user-friendly feedback and recovery options
- ✅ **Performance Optimization**: Leverages pre-fetched data to significantly reduce submission time

#### 🛠 **Service Architecture Improvements**
- ✅ **MovieProcessorService Enhanced**: Now accepts preFetchService as constructor parameter for shared caching
- ✅ **ExperimentForm Props**: Added preFetchService prop to ensure same instance is used throughout the form lifecycle
- ✅ **NewExperiment Coordination**: Properly coordinates services and passes shared instances between components
- ✅ **Memory Management**: Efficient caching with methods to clear and manage enriched data

### Current Working Features
1. **Movie Selection Pre-fetching**: Movies are enriched immediately when selected in MovieSearchModal
2. **Intelligent Processing**: Experiment submission uses pre-fetched data when available, reducing processing time
3. **Real Progress Feedback**: Users see actual backend operations (validation, processing, WordPress operations)
4. **Error Recovery**: Failed operations show clear error messages and allow retry
5. **Performance Optimization**: Pre-fetched data eliminates redundant API calls during submission

### Key Files Updated
- `/src/components/experiment/ExperimentForm.tsx` - Real progress integration and preFetchService support
- `/src/services/movie-processor.service.ts` - Enhanced to use pre-fetched data and improved error handling
- `/src/pages/NewExperiment.tsx` - Service coordination with shared preFetchService instance
- `/test-enrichment-workflow.js` - Comprehensive test
