import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Calendar, Film } from 'lucide-react';
import { Button, Input } from '../components/ui';
import { useWordPressData } from '../hooks/useWordPressData';
import { clsx } from 'clsx';

const ExperimentsList: React.FC = () => {
  const { experiments, isLoading, isLoadingMore, hasMore, error, loadMore } = useWordPressData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'scheduled' | 'draft'>('all');

  // Filter experiments based on search and filters
  const filteredExperiments = experiments.filter(experiment => {
    const matchesSearch = experiment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         experiment.number.toString().includes(searchQuery) ||
                         experiment.host.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         experiment.movies.some(movie => movie.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || experiment.status.toLowerCase() === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-secondary-600">Loading experiments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-2">⚠️ {error}</p>
          <p className="text-secondary-500 text-sm">Unable to load experiments</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Experiments</h1>
          <p className="text-secondary-600 mt-1">
            Manage your bad movie viewing experiments
          </p>
        </div>
        <Link to="/experiments/new">
          <Button size="lg">
            <Plus className="w-5 h-5 mr-2" />
            New Experiment
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="Search experiments, movies, or hosts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-secondary-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="rounded-lg border-secondary-300 text-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200">
        <div className="p-6 border-b border-secondary-200">
          <h2 className="text-xl font-semibold text-secondary-900">
            Experiments ({filteredExperiments.length})
          </h2>
        </div>

        {filteredExperiments.length > 0 ? (
          <>
            <div className="divide-y divide-secondary-200">
              {filteredExperiments.map((experiment) => (
                <div key={experiment.id} className="p-6 hover:bg-secondary-50 transition-colors duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <span className="text-lg font-bold text-primary-600">
                            #{experiment.number.toString().padStart(2, '0')}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-secondary-900">
                            {experiment.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-secondary-500">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(experiment.date).toLocaleDateString()}
                            </span>
                            <span>Host: {experiment.host.displayName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Movies */}
                    <div className="mb-3">
                      <div className="flex items-center mb-2">
                        <Film className="w-4 h-4 text-secondary-500 mr-2" />
                        <span className="text-sm font-medium text-secondary-700">
                          Movies ({experiment.movies.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {experiment.movies.map((movie, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary-100 text-secondary-700"
                          >
                            {movie.title} ({new Date(movie.releaseDate).getFullYear()})
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Platforms */}
                    <div className="flex flex-wrap gap-2">
                      {experiment.platforms.map((platform, index) => (
                        <span
                          key={index}
                          className={clsx(
                            'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium',
                            getPlatformColor(platform.name)
                          )}
                        >
                          {platform.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-4 ml-6">
                    <span
                      className={clsx(
                        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                        getStatusColor(experiment.status)
                      )}
                    >
                      {experiment.status}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/experiments/${experiment.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        View
                      </Link>
                      <Link
                        to={`/experiments/${experiment.id}/edit`}
                        className="text-secondary-600 hover:text-secondary-700 font-medium text-sm"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Load More Button */}
          {hasMore && !searchQuery && filterStatus === 'all' && (
            <div className="p-6 border-t border-secondary-200 text-center">
              <Button
                onClick={loadMore}
                disabled={isLoadingMore}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                {isLoadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                    Loading more experiments...
                  </>
                ) : (
                  <>
                    Load 5 More Experiments
                  </>
                )}
              </Button>
            </div>
          )}
          </>
        ) : (
          <div className="text-center py-12">
            {searchQuery || filterStatus !== 'all' ? (
              <>
                <Search className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                <p className="text-secondary-500">No experiments found</p>
                <p className="text-sm text-secondary-400 mt-1">
                  Try adjusting your search or filter criteria
                </p>
              </>
            ) : (
              <>
                <Film className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                <p className="text-secondary-500">No experiments yet</p>
                <p className="text-sm text-secondary-400 mt-1">
                  Create your first experiment to get started
                </p>
                <Link to="/experiments/new" className="mt-4 inline-block">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Experiment
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperimentsList;
