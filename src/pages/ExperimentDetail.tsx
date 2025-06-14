import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, MapPin, Edit, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui';
import WordPressServiceSingleton from '../services/wordpress.singleton';
import type { Experiment } from '../types';

const wordpressService = WordPressServiceSingleton.getInstance();

const ExperimentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperiment = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const exp = await wordpressService.getExperiment(parseInt(id));
        setExperiment(exp);
      } catch (err) {
        console.error('Failed to fetch experiment:', err);
        setError(`Failed to load experiment: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperiment();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-secondary-600">Loading experiment...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-2">⚠️ {error}</p>
          <Link to="/experiments">
            <Button variant="secondary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Experiments
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!experiment) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-secondary-600 mb-2">Experiment not found</p>
          <Link to="/experiments">
            <Button variant="secondary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Experiments
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'bigscreen vr':
        return 'bg-red-100 text-red-700';
      case 'discord':
        return 'bg-purple-100 text-purple-700';
      case 'twitch':
        return 'bg-indigo-100 text-indigo-700';
      case 'youtube':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-secondary-100 text-secondary-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/experiments">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">
              Experiment #{experiment.number.toString().padStart(3, '0')}
            </h1>
            <p className="text-secondary-600 mt-1">{experiment.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(experiment.status)}`}
          >
            {experiment.status}
          </span>
          <Link to={`/experiments/${experiment.id}/edit`}>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Details */}
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-secondary-500" />
                <div>
                  <p className="text-sm text-secondary-500">Date</p>
                  <p className="font-medium">{new Date(experiment.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-secondary-500" />
                <div>
                  <p className="text-sm text-secondary-500">Host</p>
                  <p className="font-medium">{experiment.host.displayName}</p>
                </div>
              </div>
            </div>

            {/* Platforms */}
            <div className="mt-6">
              <div className="flex items-center mb-3">
                <MapPin className="w-5 h-5 text-secondary-500 mr-2" />
                <span className="text-sm font-medium text-secondary-700">Platforms</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {experiment.platforms.map((platform, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${getPlatformColor(platform.name)}`}
                  >
                    {platform.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Notes */}
            {experiment.notes && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-secondary-700 mb-2">Notes</h3>
                <p className="text-secondary-600 whitespace-pre-wrap">{experiment.notes}</p>
              </div>
            )}
          </div>

          {/* Movies */}
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-secondary-900">Movies ({experiment.movies.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {experiment.movies.map((movie) => (
                <div key={movie.id} className="flex space-x-4 p-4 bg-secondary-50 rounded-lg">
                  {movie.posterPath && (
                    <img
                      src={movie.posterPath}
                      alt={movie.title}
                      className="w-16 h-24 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-secondary-900">{movie.title}</h3>
                    <p className="text-sm text-secondary-600">
                      {new Date(movie.releaseDate).getFullYear()}
                    </p>
                    {movie.runtime > 0 && (
                      <p className="text-sm text-secondary-500">{movie.runtime} minutes</p>
                    )}
                    {movie.voteAverage > 0 && (
                      <p className="text-sm text-secondary-500">
                        ⭐ {movie.voteAverage.toFixed(1)}/10
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Poster */}
          {experiment.posterImage && (
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Experiment Poster</h3>
              <img
                src={experiment.posterImage}
                alt={experiment.title}
                className="w-full rounded-lg"
              />
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-secondary-600">Total Movies</span>
                <span className="font-medium">{experiment.movies.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Total Runtime</span>
                <span className="font-medium">
                  {experiment.movies.reduce((total, movie) => total + movie.runtime, 0)} min
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Platforms</span>
                <span className="font-medium">{experiment.platforms.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperimentDetail;
