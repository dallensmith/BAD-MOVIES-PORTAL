/**
 * Get the proper image URL for a movie poster
 * Handles both TMDb paths and full URLs
 */
export const getMoviePosterUrl = (posterPath: string | undefined): string => {
  if (!posterPath) {
    return '/placeholder-movie.jpg'; // You can add a placeholder image
  }

  // If it's already a full URL (starts with http), return as-is
  if (posterPath.startsWith('http')) {
    return posterPath;
  }

  // If it starts with a slash, it's a TMDb path, build the full URL
  if (posterPath.startsWith('/')) {
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  }

  // If it's just a filename or other format, try to use it as TMDb path
  if (posterPath && !posterPath.includes('/')) {
    return `https://image.tmdb.org/t/p/w500/${posterPath}`;
  }

  // Default fallback
  return posterPath;
};

/**
 * Get a thumbnail version of the movie poster
 */
export const getMoviePosterThumbnail = (posterPath: string | undefined): string => {
  if (!posterPath) {
    return '/placeholder-movie.jpg';
  }

  // If it's already a full URL (starts with http), return as-is (can't resize)
  if (posterPath.startsWith('http')) {
    return posterPath;
  }

  // If it starts with a slash, it's a TMDb path, build the thumbnail URL
  if (posterPath.startsWith('/')) {
    return `https://image.tmdb.org/t/p/w300${posterPath}`;
  }

  // If it's just a filename, try to use it as TMDb path
  if (posterPath && !posterPath.includes('/')) {
    return `https://image.tmdb.org/t/p/w300/${posterPath}`;
  }

  // Default fallback
  return posterPath;
};
