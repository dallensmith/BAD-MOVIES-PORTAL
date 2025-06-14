import { X } from 'lucide-react';
import { Button } from '../ui';
import { clsx } from 'clsx';
import type { MovieSelectionData } from '../../types';

interface MovieListProps {
  movies: MovieSelectionData[];
  onRemoveMovie: (movieId: number) => void;
  isEditable?: boolean;
  className?: string;
}

const MovieList: React.FC<MovieListProps> = ({
  movies,
  onRemoveMovie,
  isEditable = true,
  className,
}) => {
  if (movies.length === 0) {
    return (
      <div className={clsx('text-center py-8 border-2 border-dashed border-secondary-300 rounded-lg', className)}>
        <p className="text-secondary-500">No movies selected</p>
        <p className="text-sm text-secondary-400 mt-1">
          Click "Add Movie" to search and add movies to this experiment
        </p>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-4', className)}>
      <h3 className="text-lg font-medium text-secondary-900">
        Selected Movies ({movies.length})
      </h3>
      
      <div className="grid gap-4">
        {movies.map((movie) => (
          <div
            key={movie.tmdbId}
            className="flex space-x-4 p-4 border border-secondary-200 rounded-lg bg-white hover:shadow-sm transition-shadow duration-200"
          >
            {/* Movie Poster */}
            <div className="flex-shrink-0">
              <img
                src={movie.posterPath}
                alt={movie.title}
                className="w-16 h-24 object-cover rounded-md bg-secondary-100"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-poster.png';
                }}
              />
            </div>

            {/* Movie Details */}
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-medium text-secondary-900">
                {movie.title}
              </h4>
              {movie.releaseDate && (
                <p className="text-sm text-secondary-500">
                  {new Date(movie.releaseDate).getFullYear()}
                </p>
              )}
              <p className="text-sm text-secondary-700 mt-2 line-clamp-2">
                {movie.overview}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-secondary-500">
                  ⭐ {movie.voteAverage.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Remove Button */}
            {isEditable && (
              <div className="flex-shrink-0 flex items-start">
                <Button
                  onClick={() => onRemoveMovie(movie.tmdbId)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Remove movie"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieList;
