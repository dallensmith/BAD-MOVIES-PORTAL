## 🎬 Bad Movies Portal - AI Developer Onboarding Prompt

### Hello, Next AI Developer! 

You're about to work on something truly special - the Bad Movies Portal, a passion project to create the internet's definitive "so bad it's good" movie database. Your predecessor has left you with excellent foundations and clear guidance.

## 🚀 IMMEDIATE SETUP STEPS

1. **Read the Documentation First**:
   - Start with `README.md` for project overview and current status
   - **CRITICAL**: Read `AI_INSTRUCTIONS.md` thoroughly - it contains essential context and debugging guidance
   - Review `pods-structure.json` to understand the WordPress data structure

2. **Understand the Current State**:
   - ✅ **Working Perfectly**: Movie search, UI, experiment management, image handling
   - 🚨 **Critical Issue**: Movie field mapping - entities created but fields empty
   - 🎯 **Your Mission**: Fix WordPress field mapping in movie enrichment system

3. **Get Development Environment Ready**:
   ```bash
   npm install
   npm run dev  # Should start on localhost:5176
   ```

4. **Test the Current Functionality**:
   - Try searching for movies (this works great!)
   - Try creating an experiment with a movie (images upload, but movie fields stay empty)
   - Check browser console for any errors

## 🎯 YOUR PRIMARY OBJECTIVE

**Fix the movie field mapping issue** in `/src/services/movie-enrichment.service.ts`:

**The Problem**: 
- Movie entities are created in WordPress ✅
- All related entities created (actors, directors, writers, etc.) ✅  
- Poster images upload correctly ✅
- **But movie fields remain empty** ❌
- **No relational connections established** ❌

**The Solution Path**:
1. Compare the enriched data structure with `pods-structure.json` field names
2. Fix the `createMovieEntity` method field mapping
3. Ensure relational fields (movie_actors, movie_directors, etc.) are properly connected
4. Test with a single movie to verify all data populates

## 💡 WORKING WITH YOUR HUMAN PARTNER

**About Them**:
- Incredibly patient and understanding
- Has a clear vision for the project
- Excellent technical instincts - trust their guidance
- Will give you detailed feedback and context when needed
- Deeply cares about getting this project right

**Communication Tips**:
- Ask questions when the WordPress Pods structure gets complex
- They prefer detailed explanations of what you're doing and why
- If something isn't working, show them the specific error messages
- They appreciate when you read the existing documentation before asking

## 🛠 KEY FILES TO FOCUS ON

**Primary Target**:
- `/src/services/movie-enrichment.service.ts` (lines ~800-900, createMovieEntity method)

**Critical References**:
- `/pods-structure.json` - WordPress field structure (your north star)
- `/AI_INSTRUCTIONS.md` - Comprehensive development guide
- `/src/types/index.ts` - Type definitions

**Don't Touch Unless Asked**:
- `/src/components/movie/MovieSearchModal.tsx` - Search works perfectly
- `/src/services/tmdb.service.ts` - TMDb integration is solid
- `/src/components/experiment/ExperimentForm.tsx` - UI is polished

## 🔍 DEBUGGING APPROACH

1. **Start Small**: Test with one movie first
2. **Check Console**: WordPress API errors will show field mapping issues
3. **Verify Endpoints**: All REST endpoints are correct (actors, directors, movies, etc.)
4. **Compare Structures**: Match enriched data fields with WordPress Pods field names
5. **Test Incrementally**: Fix one field type at a time

## 📋 SUCCESS CRITERIA

You'll know you've succeeded when:
- Movie entities have populated fields (title, overview, release_date, etc.)
- Relational connections work (movies linked to actors, directors, writers)
- All enriched data from TMDb appears in WordPress
- No empty movie records (except for the poster which already works)

## 🎭 PROJECT VISION

This isn't just a technical project - it's about building something that could become a beloved community resource for wonderfully terrible movie fans. The technical foundation is excellent, the UX is polished, and you're just one field mapping fix away from something truly special.

Your predecessor built something robust and extensible. Don't reinvent what's working - focus on completing the WordPress integration and you'll have helped create something amazing.

## 🎬 FINAL WORDS

The previous AI developer was incredibly thorough and thoughtful. They've left you with clean code, comprehensive documentation, and a clear path forward. Honor their work by building on their solid foundation.

You're working with a human who has a beautiful vision and the patience to see it through. Help them bring this passion project to life.

**Welcome to the team, and may your WordPress field mappings always be correct!**

---

*"So bad it's good" - the motto that drives us all.*

**Git Repository**: https://github.com/dallensmith/BAD-MOVIES-PORTAL  
**Development Command**: `npm run dev`  
**Critical File**: `src/services/movie-enrichment.service.ts`  
**Reference**: `pods-structure.json`
