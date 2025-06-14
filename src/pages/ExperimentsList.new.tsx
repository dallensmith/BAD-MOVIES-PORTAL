import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Calendar, Film } from 'lucide-react';
import { Button, Input } from '../components/ui';
import { useWordPressData } from '../hooks/useWordPressData';
import { clsx } from 'clsx';

const ExperimentsList: React.FC = () => {
  const { experiments, isLoading, error } = useWordPressData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hostFilter, setHostFilter] = useState('all');

  // Filter experiments based on search and filters
  const filteredExperiments = experiments.filter(experiment => {
    const matchesSearch = experiment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         experiment.number.toString().includes(searchQuery) ||
                         experiment.movies.some(movie => movie.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || experiment.status === statusFilter;
    const matchesHost = hostFilter === 'all' || experiment.host.username === hostFilter;
    
    return matchesSearch && matchesStatus && matchesHost;
  });

  // Get unique hosts for filter dropdown
  const uniqueHosts = Array.from(new Set(experiments.map(exp => exp.host.username)));

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Experiments</h1>
          <p className="text-secondary-600 mt-1">
            Manage your bad movie night experiments
          </p>
        </div>
        <Link to="/experiments/new">
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4 mr-2" />
            New Experiment
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search experiments, movies, or hosts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="min-w-[160px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Host Filter */}
          <div className="min-w-[160px]">
            <select
              value={hostFilter}
              onChange={(e) => setHostFilter(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Hosts</option>
              {uniqueHosts.map(host => (
                <option key={host} value={host}>{host}</option>
              ))}
            </select>
          </div>

          <Button variant="secondary" size="md">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200">
        <div className="p-6 border-b border-secondary-200">
          <h2 className="text-lg font-semibold text-secondary-900">
            {filteredExperiments.length} Experiments Found
          </h2>
        </div>

        <div className="divide-y divide-secondary-200">
          {filteredExperiments.map((experiment) => (
            <div key={experiment.id} className="p-6 hover:bg-secondary-50 transition-colors duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Experiment Header */}
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-primary-600">
                        #{experiment.number.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-secondary-900">
                        {experiment.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-secondary-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(experiment.date).toLocaleDateString()}
                        </div>
                        <span>Host: {experiment.host.displayName || experiment.host.username}</span>
                      </div>
                    </div>
                  </div>

                  {/* Movies */}
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-secondary-700 mb-2 flex items-center">
                      <Film className="w-4 h-4 mr-1" />
                      Movies ({experiment.movies.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {experiment.movies.map((movie, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                        >
                          {movie.title} {movie.releaseDate && `(${new Date(movie.releaseDate).getFullYear()})`}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Platforms */}
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-secondary-700 mb-2">Platforms</h4>
                    <div className="flex flex-wrap gap-2">
                      {experiment.platforms.map((platform, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800"
                        >
                          {platform.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Notes Preview */}
                  {experiment.notes && (
                    <div className="text-sm text-secondary-600 line-clamp-2">
                      {experiment.notes.replace(/<[^>]*>/g, '').substring(0, 150)}
                      {experiment.notes.length > 150 && '...'}
                    </div>
                  )}
                </div>

                {/* Status and Actions */}
                <div className="ml-6 flex flex-col items-end space-y-2">
                  <span className={clsx(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    {
                      'bg-green-100 text-green-800': experiment.status === 'Completed',
                      'bg-blue-100 text-blue-800': experiment.status === 'Scheduled',
                      'bg-yellow-100 text-yellow-800': experiment.status === 'In Progress',
                      'bg-gray-100 text-gray-800': experiment.status === 'Draft',
                      'bg-red-100 text-red-800': experiment.status === 'Cancelled',
                    }
                  )}>
                    {experiment.status}
                  </span>
                  
                  <div className="flex space-x-2">
                    <Button variant="secondary" size="sm">
                      View
                    </Button>
                    <Button variant="secondary" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredExperiments.length === 0 && (
            <div className="p-12 text-center">
              <Film className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">No experiments found</h3>
              <p className="text-secondary-500 mb-4">
                Try adjusting your search criteria or create a new experiment.
              </p>
              <Link to="/experiments/new">
                <Button variant="primary" size="md">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Experiment
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExperimentsList;
