## 🎬 NEXT AI DEVELOPER - ONBOARDING PROMPT

**Copy and paste this entire prompt to get your successor started:**

---

Hello! You're inheriting the Bad Movies Portal project - a sophisticated React + TypeScript application for managing "bad movie viewing experiments" with the goal of creating the internet's definitive "so bad it's good" movie database.

### 🎉 EXCELLENT NEWS - BACKEND MIGRATION COMPLETE!

**What Just Happened**: The previous AI successfully migrated the entire backend from SQLite/WordPress to PocketBase, eliminating all the complex data mapping issues that were causing problems.

**Current Status**: ✅ **PRODUCTION READY BACKEND**
- **PocketBase Backend**: Fully configured remote instance
- **Comprehensive Schema**: 29 movie fields + relationships matching WordPress Pods
- **TypeScript Service**: Complete CRUD operations tested and validated
- **All Data Types**: Movies, actors, directors, writers, experiments, etc.
- **Affiliate Links**: Amazon integration ready, future streaming services prepared

### 🎯 YOUR MISSION: FRONTEND INTEGRATION

**Priority 1**: Connect React components to PocketBase service layer
**Priority 2**: Implement TMDb → PocketBase data enrichment workflow
**Priority 3**: Test end-to-end movie management lifecycle

### 🛠️ WHAT'S READY FOR YOU

**PocketBase Service** (✅ Complete):
```typescript
// Location: src/services/pocketbase.service.ts
import { pocketbaseService } from './services/pocketbase.service';

// All operations tested and working:
await pocketbaseService.authenticate(email, password);
const movies = await pocketbaseService.getAllMovies();
const movie = await pocketbaseService.createMovie(movieData);
const updated = await pocketbaseService.updateMovie(id, changes);
const results = await pocketbaseService.searchMovies(query);
```

**Schema Overview**:
- **Movies**: 29 fields including TMDb data, affiliate links, financial info
- **Relationships**: movie_actors, movie_directors, movie_writers, etc.
- **Experiments**: Full experiment tracking with movie relationships

### 🔄 FRONTEND COMPONENTS TO UPDATE

**High Priority Files**:
```
src/components/movie/MovieList.tsx         # Connect to pocketbaseService.getAllMovies()
src/components/movie/MovieEditModal.tsx    # Update forms for 29-field schema
src/components/movie/MovieSearchModal.tsx  # Use pocketbaseService.searchMovies()
src/services/movie-enrichment.service.ts   # TMDb → PocketBase integration
```

**Pattern to Follow**:
```typescript
// OLD (WordPress - remove these)
const movies = await wordpressService.getMovies();

// NEW (PocketBase - implement these)
const movies = await pocketbaseService.getAllMovies();
```

### 🎯 WHAT'S WORKING PERFECTLY (DON'T BREAK!)

- **PocketBase Backend**: Production-ready, all CRUD tested ✅
- **TypeScript Service**: Complete type safety and error handling ✅
- **Movie Search UI**: Advanced TMDb search interface ✅
- **Component Architecture**: Clean, reusable React components ✅
- **Build System**: Vite + TypeScript optimized ✅

### 🚨 CRITICAL DEVELOPMENT RULES

**DO**:
- ✅ Use the existing `pocketbaseService` for all backend operations
- ✅ Focus on frontend integration and user experience
- ✅ Test movie CRUD operations end-to-end
- ✅ Maintain type safety throughout
- ✅ Ask questions about the "bad movie" community context

**DON'T**:
- ❌ Modify the PocketBase service layer (it's tested and works)
- ❌ Try to rebuild the backend (it's production-ready)
- ❌ Break the existing TMDb search functionality
- ❌ Remove affiliate link support (critical for monetization)

### 🔧 QUICK DEVELOPMENT SETUP

1. **Environment**: Ensure `.env` has PocketBase credentials
2. **Dependencies**: `npm install` (PocketBase SDK already added)
3. **Dev Server**: `npm run dev`
4. **Service Test**: Import `pocketbaseService` and test basic operations

### 📊 SUCCESS METRICS

**Phase 1 Complete When**:
- [ ] Movies display from PocketBase instead of WordPress
- [ ] Movie creation/editing uses PocketBase service
- [ ] TMDb search stores movies in PocketBase
- [ ] All 29 movie fields available in forms

**Phase 2 Complete When**:
- [ ] Relationship management (actors, directors, etc.)
- [ ] Advanced search with pagination
- [ ] Image handling optimized
- [ ] Experiment-to-movie relationships enhanced

### 📚 KEY DOCUMENTATION

- **Migration Success**: `docs/POCKETBASE_MIGRATION_SUCCESS.md`
- **Detailed Instructions**: `AI_INSTRUCTIONS.md`
- **Schema Reference**: All entities defined in TypeScript service
- **Original Requirements**: `pods-structure.json` (now implemented in PocketBase)

### 🎭 PROJECT CONTEXT

**Community**: "So bad it's good" movie enthusiasts
**Goal**: Definitive database for terrible movies with affiliate monetization
**User Workflows**: Event planning, movie discovery, data enrichment, content creation

**Key Features Needed**:
- Comprehensive movie data with TMDb integration
- Amazon affiliate links (working), future streaming services
- Experiment tracking for group viewing events
- Search and filtering for movie discovery

### 💡 DEVELOPER NOTES

**Technical Foundation**: Rock solid. The PocketBase migration eliminated all the complex WordPress field mapping issues. You have a production-ready backend with comprehensive type safety.

**Your Focus**: User experience and frontend polish. The backend will support whatever you build.

**Community Impact**: This serves a unique, passionate community. Every decision should consider how it helps people who love terrible movies share that joy with others.

### 🚀 GET STARTED

1. **Read**: `AI_INSTRUCTIONS.md` for comprehensive guidance
2. **Explore**: `src/services/pocketbase.service.ts` to understand available operations
3. **Test**: Try basic movie operations to verify backend connectivity
4. **Plan**: Identify which components need PocketBase integration first
5. **Build**: Focus on one component at a time, test thoroughly

**Remember**: The hard work is done. You're building on a solid foundation. Focus on creating an amazing user experience for the bad movie community!

---

**Status**: ✅ Backend Complete → 🔄 Frontend Integration Phase  
**Your Mission**: Connect beautiful React UI to robust PocketBase backend
