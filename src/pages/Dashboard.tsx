import { Film, Plus, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';
import { useWordPressData } from '../hooks/useWordPressData';

const Dashboard: React.FC = () => {
  const { experiments, stats, isLoading, error } = useWordPressData();

  // Get recent experiments (last 3)
  const recentExperiments = experiments
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
    .map(exp => ({
      id: exp.id,
      number: exp.number,
      title: exp.title,
      date: exp.date,
      moviesCount: exp.movies.length,
      status: exp.status,
    }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-secondary-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-2">⚠️ {error}</p>
          <p className="text-secondary-500 text-sm">Showing fallback data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Dashboard</h1>
          <p className="text-secondary-600 mt-1">
            Welcome back! Here's what's happening with your bad movie experiments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/experiments/new">
            <Button size="lg">
              <Plus className="w-5 h-5 mr-2" />
              New Experiment
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Film className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Experiments</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.totalExperiments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-accent-100 rounded-lg">
              <Calendar className="w-6 h-6 text-accent-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">This Month</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.experimentsThisMonth}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Film className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Movies</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.totalMovies}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total People</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.totalPeople}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Experiments */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200">
        <div className="p-6 border-b border-secondary-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-secondary-900">
              Recent Experiments
            </h2>
            <Link 
              to="/experiments"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </Link>
          </div>
        </div>
        
        <div className="p-6">
          {recentExperiments.length > 0 ? (
            <div className="space-y-4">
              {recentExperiments.map((experiment) => (
                <div
                  key={experiment.id}
                  className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-600">
                        #{experiment.number.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-secondary-900">
                        {experiment.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-secondary-500">
                        <span>{new Date(experiment.date).toLocaleDateString()}</span>
                        <span>{experiment.moviesCount} movies</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {experiment.status}
                    </span>
                    <Link
                      to={`/experiments/${experiment.id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
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
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link 
          to="/experiments/new"
          className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors duration-200">
              <Plus className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-secondary-900">New Experiment</h3>
              <p className="text-sm text-secondary-500">Create a new movie viewing experiment</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/experiments"
          className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-center">
            <div className="p-3 bg-accent-100 rounded-lg group-hover:bg-accent-200 transition-colors duration-200">
              <Film className="w-6 h-6 text-accent-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-secondary-900">All Experiments</h3>
              <p className="text-sm text-secondary-500">View and manage all experiments</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/people"
          className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-200">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-secondary-900">People</h3>
              <p className="text-sm text-secondary-500">Browse actors, directors, and crew</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
