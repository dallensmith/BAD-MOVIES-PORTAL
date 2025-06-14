# Bad Movies Portal

A production-ready, modular React + TypeScript portal for managing movie viewing experiments with intelligent automation, comprehensive data management, and seamless WordPress integration.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- TMDb API Key (get from [TMDb](https://www.themoviedb.org/settings/api))
- WordPress site with REST API enabled (optional for full functionality)

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd BAD-MOVIES-PORTAL
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   # TMDb API Key - Required for movie data
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   
   # WordPress Configuration - Optional
   VITE_WORDPRESS_URL=http://localhost:8080
   VITE_WORDPRESS_API_URL=http://localhost:8080/wp-json
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:5173](http://localhost:5173)

## ✨ Features

### 🎬 Experiment Management
- **Auto-generated experiment numbers** (001, 002, 003...)
- **Intelligent movie search** with TMDb integration
- **Real-time progress tracking** during data processing
- **Platform selection** (Bigscreen VR, Discord, Twitch, YouTube)
- **Host assignment** from WordPress users

### 🎭 Movie Database Integration
- **Instant movie search** with debounced queries
- **Complete movie metadata** (cast, crew, genres, studios)
- **Automatic image processing** and optimization
- **Duplicate prevention** with intelligent matching

### 🎨 Modern UI/UX
- **Beautiful, responsive design** with Tailwind CSS
- **Dark/light theme support**
- **Mobile-first approach**
- **Accessible components** with proper ARIA labels
- **Loading states** and error handling

### 🔧 Technical Excellence
- **TypeScript throughout** for type safety
- **Modular architecture** for maintainability
- **Performance optimized** with caching and lazy loading
- **Error boundaries** for graceful failure handling

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (Button, Input, Modal)
│   ├── layout/          # Layout components (Header, Layout)
│   ├── movie/           # Movie-specific components
│   └── experiment/      # Experiment-specific components
├── pages/               # Page components
├── services/            # API services (TMDb, WordPress)
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── utils/               # Utility functions and config
└── store/               # State management
```

## 🎯 Core Workflows

### Creating a New Experiment

1. **Automatic Setup**: System generates experiment number and sets defaults
2. **Basic Info**: Configure title, date, host, and platforms
3. **Movie Selection**: Search and add movies with instant TMDb integration
4. **Processing**: Watch real-time progress as data is enriched and uploaded
5. **Completion**: Review final experiment with all relationships created

### Intelligent Movie Search

1. **Type to Search**: Instant results as you type (debounced)
2. **Rich Results**: See posters, ratings, and overviews
3. **Smart Selection**: Prevent duplicates automatically
4. **Full Processing**: Complete cast, crew, and metadata extraction

## 🔌 API Integration

### TMDb (The Movie Database)
- Movie search and details
- Cast and crew information
- Images and metadata
- Genre and studio data

### WordPress (Optional)
- Experiment storage
- User management
- Media library integration
- Custom post types and fields

## 🎨 Design System

### Color Palette
- **Primary**: Blue tones for main actions
- **Secondary**: Gray scale for text and backgrounds  
- **Accent**: Purple for highlights and special elements
- **Status**: Green (success), Red (error), Yellow (warning)

### Typography
- **Font**: Inter for modern, readable text
- **Hierarchy**: Clear heading and body text scales
- **Accessibility**: Proper contrast ratios throughout

## 🚀 Performance Features

### Caching Strategy
- **Memory cache** for frequently accessed data
- **Persistent storage** for offline capability
- **Intelligent invalidation** based on TTL and updates

### Optimization
- **Lazy loading** for images and components
- **Debounced search** to reduce API calls
- **Code splitting** for faster initial loads
- **Image optimization** with multiple sizes and WebP

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run test     # Run tests (when implemented)
```

### Development Tools

- **Vite** for fast development and building
- **TypeScript** for type safety
- **ESLint** for code quality
- **Tailwind CSS** for styling
- **React Router** for navigation

## 🌟 Future Enhancements

Based on the complete specification, planned features include:

- **Advanced Analytics**: Experiment performance metrics
- **Batch Operations**: Multi-experiment management
- **Export Capabilities**: PDF reports and data exports
- **Advanced Filtering**: Complex search and filter options
- **Real-time Collaboration**: Multi-user experiment editing
- **API Extensions**: Additional movie database sources

## 📱 Browser Support

- **Modern browsers** (Chrome, Firefox, Safari, Edge)
- **Mobile responsive** design
- **Progressive Web App** capabilities (planned)

## 🤝 Contributing

This project follows a modular architecture making it easy to contribute:

1. **Components**: Add new UI components in `src/components/`
2. **Pages**: Create new pages in `src/pages/`
3. **Services**: Extend API integrations in `src/services/`
4. **Types**: Add TypeScript definitions in `src/types/`

## 📄 License

This project is proprietary software for managing bad movie viewing experiments.

---

**Built with ❤️ for bad movie enthusiasts everywhere!** 🎬🍿
