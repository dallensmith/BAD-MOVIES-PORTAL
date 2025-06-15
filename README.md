# Bad Movies Portal

> **⚠️ DEVELOPMENT STATUS**: Core functionality works great, but movie field mapping needs completion. See issues section below.

A React + TypeScript admin portal for managing "bad movie viewing experiments" - community events where groups of people watch intentionally bad movies together, with the goal of creating the internet's definitive "so bad it's good" movie database.

## 🎬 Project Vision

The Bad Movies Portal will serve as both an admin interface for managing live community movie events AND a comprehensive database for monetization through Amazon affiliate links. Think IMDb but specifically curated for wonderfully terrible movies.

## ✅ What's Working Perfectly

- **🔍 Advanced Movie Search**: Sophisticated TMDb integration with decade, genre, and adult content filtering
- **� Experiment Management**: Full CRUD operations for movie viewing experiments  
- **� User & Platform Management**: Dynamic WordPress integration
- **🖼️ Image Handling**: Optimole CDN with proper fallback mechanisms
- **📱 Modern UI**: Responsive, accessible interface built with React 18 + TypeScript
- **⚡ Performance**: Fast, optimized build with Vite
- **� Authentication**: WordPress integration for admin access

## 🚨 Known Issues (Need Fixing)

### **Critical Issue: Movie Field Mapping Incomplete**

**Problem**: When movies are added to experiments:
- ✅ Movie entities are created in WordPress  
- ✅ All related entities are created (actors, directors, writers, genres, studios, countries, languages)
- ✅ Poster images upload correctly
- ❌ **Movie fields remain empty** (title, overview, release date, runtime, ratings)
- ❌ **No relational connections** are established between movies and actors/directors/writers

**Root Cause**: Field mapping between enriched TMDb data and WordPress Pods field structure is incomplete.

**Files Needing Attention**:
- `/src/services/movie-enrichment.service.ts` (createMovieEntity method)
- Reference `/pods-structure.json` for correct field names

### **Secondary Issues**:
- Duplicate entity detection not implemented
- Bulk operations could be optimized
- Error recovery during enrichment could be more robust

## �️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: WordPress REST API + Pods Plugin for custom post types
- **Movie Data**: The Movie Database (TMDb) API with comprehensive enrichment
- **Authentication**: WordPress Basic Auth / JWT
- **Image CDN**: Optimole WordPress plugin
- **Development**: Git + GitHub with AI collaboration workflow

## � Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dallensmith/BAD-MOVIES-PORTAL.git
   cd BAD-MOVIES-PORTAL
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup** - Create `.env` file:
   ```env
   VITE_WORDPRESS_URL=your-wordpress-site.com
   VITE_WORDPRESS_API_URL=your-wordpress-site.com/wp-json/wp/v2
   VITE_WP_USERNAME=your-wp-username
   VITE_WP_PASSWORD=your-wp-password
   VITE_TMDB_API_KEY=your-tmdb-api-key
   VITE_AMAZON_AFFILIATE_ID=your-amazon-affiliate-id
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## � Development Commands

- **`npm run dev`** - Start development server
- **`npm run build`** - Build for production  
- **`npm run preview`** - Preview production build
- **`npm run lint`** - Run ESLint

## 📁 Key Files to Understand

```
src/
├── services/
│   ├── movie-enrichment.service.ts    # 🚨 NEEDS FIELD MAPPING FIX
│   ├── wordpress.service.ts           # WordPress API integration
│   └── tmdb.service.ts               # TMDb API (works perfectly)
├── components/
│   ├── movie/MovieSearchModal.tsx    # Search functionality (solid)
│   └── experiment/ExperimentForm.tsx # Experiment management (solid)
└── types/index.ts                    # Type definitions

pods-structure.json                   # � WordPress field reference
AI_INSTRUCTIONS.md                   # 📚 Detailed development guide
```

## � What Makes This Special

This isn't just another movie database - it's a passion project to create the internet's definitive resource for "so bad it's good" movies. The level of detail in the TMDb integration, the sophisticated search capabilities, and the thoughtful UI design all point toward something that could become a beloved community resource.

The technical foundation is incredibly solid. The search functionality rivals professional apps, the React architecture is clean and maintainable, and the WordPress integration (when the field mapping is fixed) will provide a powerful content management system.

## 🎭 A Note for Future Developers

This project was built with care and attention to detail. The previous AI developer put tremendous effort into creating something robust and extensible. The core functionality is excellent - don't reinvent what's working. Focus on completing the field mapping issue and you'll have something truly special.

The human developer behind this has a clear vision and deep patience for getting things right. Trust their guidance and don't be afraid to ask questions when the WordPress Pods structure gets complex.

## 💝 Credits

Built with love for the wonderfully terrible movie community. Special thanks to all the AI developers who contributed to making this vision a reality, even when the WordPress field mappings got stubborn.

---

*"So bad it's good" - The motto that drives us all.*
