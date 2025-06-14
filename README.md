# Bad Movies Portal

A React + TypeScript admin portal for managing "bad movie viewing experiments" - community events where groups of people watch intentionally bad movies together.

## 🎬 Project Overview

The Bad Movies Portal is a modern web application that serves as an admin interface for managing movie experiments, integrating with WordPress (using Pods) as a backend CMS and The Movie Database (TMDb) for rich movie data.

### Key Features

- **📱 Modern UI**: Built with React 18, TypeScript, and Tailwind CSS
- **🎞️ Movie Management**: Search and add movies from TMDb with rich metadata
- **🎪 Experiment Management**: Create and edit movie viewing experiments with platforms, hosts, and participants
- **👥 User Management**: WordPress user integration for host assignment
- **🔗 Platform Integration**: Dynamic platform management (Bigscreen VR, Vimeo, etc.)
- **🖼️ Image Optimization**: Optimole CDN integration for movie posters
- **📊 Auto-numbering**: Sequential experiment numbering with smart auto-increment
- **🔗 Permalink Management**: Automatic slug generation with manual override support

## 🚀 Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom components
- **Backend**: WordPress REST API + Pods Plugin
- **Movie Data**: The Movie Database (TMDb) API
- **Authentication**: WordPress Basic Auth / JWT
- **Image CDN**: Optimole WordPress plugin
- **Version Control**: Git + GitHub

## 🛠️ Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dallensmith/BAD-MOVIES-PORTAL.git
   cd BAD-MOVIES-PORTAL
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env` file with your WordPress and TMDb credentials:
   ```env
   VITE_WORDPRESS_URL=your-wordpress-site.com
   VITE_WORDPRESS_API_URL=your-wordpress-site.com/wp-json
   VITE_WP_USERNAME=your-username
   VITE_WP_PASSWORD=your-app-password
   VITE_TMDB_API_KEY=your-tmdb-api-key
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── experiment/     # Experiment-related components
│   ├── layout/         # Layout components (Header, Layout)
│   ├── movie/          # Movie management components
│   └── ui/             # Base UI components (Button, Modal, etc.)
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API services (WordPress, TMDb)
├── store/              # State management
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🔧 Build & Deployment

- **Development**: `npm run dev`
- **Build**: `npm run build`
- **Preview**: `npm run preview`
- **Lint**: `npm run lint`

## 📖 Documentation

- **[AI Instructions](AI_INSTRUCTIONS.md)**: Comprehensive guide for AI-assisted development
- **[Setup Guide](README_SETUP.md)**: Detailed setup instructions

## 🤝 Contributing

This project uses Git for version control with AI-assisted development practices. See `AI_INSTRUCTIONS.md` for detailed collaboration guidelines.

## 📄 License

Private project - All rights reserved.
