import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Edit2, X } from 'lucide-react';
import { Button, Input } from '../components/ui';
import { MovieEditModal } from '../components/movie';
import WordPressServiceSingleton from '../services/wordpress.singleton';
import type { Experiment, Movie, EventPlatform } from '../types';

const wordpressService = WordPressServiceSingleton.getInstance();

const ExperimentEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Movie edit modal state
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);

  // WordPress users state
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [userLoadError, setUserLoadError] = useState<string | null>(null);

  // Platform state
  const [platforms, setPlatforms] = useState<EventPlatform[]>([]);
  const [isLoadingPlatforms, setIsLoadingPlatforms] = useState(true);
  const [platformLoadError, setPlatformLoadError] = useState<string | null>(null);

  // Image upload state
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

  // Helper functions for user display
  const getUserDisplayName = (user: any): string => {
    return user?.name || user?.display_name || user?.displayName || user?.username || user?.login || `User ${user?.id || 'Unknown'}`;
  };

  const getUserUsername = (user: any): string => {
    return user?.username || user?.login || user?.slug || user?.user_login || 'no-username';
  };

  // Platform helper functions
  const handlePlatformToggle = (platformId: number) => {
    if (!experiment) return;
    
    const currentPlatformIds = experiment.platforms.map(p => p.id);
    const newPlatformIds = currentPlatformIds.includes(platformId)
      ? currentPlatformIds.filter(id => id !== platformId)
      : [...currentPlatformIds, platformId];
    
    const newPlatforms = platforms.filter(p => newPlatformIds.includes(p.id));
    
    setExperiment({
      ...experiment,
      platforms: newPlatforms
    });
    
    setError(null);
    setSuccessMessage(null);
  };

  useEffect(() => {
    const fetchExperiment = async () => {
      if (!id) {
        setError('No experiment ID provided');
        setIsLoading(false);
        return;
      }
      
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

  // Load WordPress users and platforms
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingUsers(true);
        setIsLoadingPlatforms(true);
        setUserLoadError(null);
        setPlatformLoadError(null);

        const [allUsers, eventPlatforms] = await Promise.all([
          wordpressService.getUsers(),
          wordpressService.getEventPlatforms()
        ]);

        setUsers(allUsers);
        setPlatforms(eventPlatforms);
      } catch (error) {
        console.error('Failed to load WordPress data:', error);
        if (error instanceof Error) {
          if (error.message.includes('user')) {
            setUserLoadError(error.message);
          } else {
            setPlatformLoadError(error.message);
          }
        } else {
          setUserLoadError('Failed to load data');
          setPlatformLoadError('Failed to load data');
        }
      } finally {
        setIsLoadingUsers(false);
        setIsLoadingPlatforms(false);
      }
    };

    loadData();
  }, []);

  const handleSave = async (updatedExperiment: Partial<Experiment>) => {
    if (!experiment) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      let experimentToSave = {
        ...experiment,
        ...updatedExperiment,
        id: experiment.id,
      };

      // If there's a pending image file, upload it first
      if (pendingImageFile) {
        const filename = `experiment-${experiment.number.toString().padStart(3, '0')}-${Date.now()}.${pendingImageFile.name.split('.').pop()}`;
        const uploadResult = await wordpressService.uploadImage(pendingImageFile, filename);
        
        // Add the uploaded image to the experiment data
        experimentToSave = {
          ...experimentToSave,
          experimentImageId: uploadResult.thumbnail.id,
          posterImage: uploadResult.originalUrl
        };

        // Clear the pending image file
        setPendingImageFile(null);
      }
      
      await wordpressService.saveExperiment(experimentToSave);
      
      setSuccessMessage('Experiment saved successfully!');
      
      // Navigate back to the experiment detail page after a short delay
      setTimeout(() => {
        navigate(`/experiments/${experiment.id}`);
      }, 1500);
    } catch (err) {
      console.error('Failed to save experiment:', err);
      setError(`Failed to save experiment: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsMovieModalOpen(true);
  };

  const handleMovieSave = async (updatedMovie: Movie) => {
    if (!experiment) return;

    try {
      // Save the movie to WordPress
      const savedMovie = await wordpressService.saveMovie(updatedMovie);
      
      // Update the local experiment state with the saved movie
      const updatedMovies = experiment.movies.map(movie => 
        movie.id === savedMovie.id ? savedMovie : movie
      );

      setExperiment({
        ...experiment,
        movies: updatedMovies
      });

      setIsMovieModalOpen(false);
      setSelectedMovie(null);
      
      // Show success message
      setError(null);
      setSuccessMessage('Movie updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to save movie:', err);
      setError(`Failed to save movie: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setSuccessMessage(null);
    }
  };

  const handleCloseMovieModal = () => {
    setIsMovieModalOpen(false);
    setSelectedMovie(null);
  };

  const handleRemoveMovie = async (movieToRemove: Movie) => {
    if (!experiment) return;
    
    if (!confirm(`Are you sure you want to remove "${movieToRemove.title}" from this experiment?`)) {
      return;
    }

    try {
      // Remove the movie from the local experiment state
      const updatedMovies = experiment.movies.filter(movie => movie.id !== movieToRemove.id);
      
      const updatedExperiment = {
        ...experiment,
        movies: updatedMovies
      };

      setExperiment(updatedExperiment);
      
      // Save the updated experiment to WordPress
      await wordpressService.saveExperiment(updatedExperiment);
      
      setError(null);
      setSuccessMessage(`"${movieToRemove.title}" removed from experiment successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to remove movie from experiment:', err);
      setError(`Failed to remove movie: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setSuccessMessage(null);
    }
  };

  const handleDelete = async () => {
    if (!experiment) return;
    
    if (!confirm(`Are you sure you want to delete "${experiment.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsSaving(true);
      await wordpressService.deleteExperiment(experiment.id);
      navigate('/experiments');
    } catch (err) {
      console.error('Failed to delete experiment:', err);
      setError(`Failed to delete experiment: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExperimentImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !experiment) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file must be less than 5MB');
      return;
    }

    // Just update the pending image file state
    // The upload will happen when the user clicks Save
    setPendingImageFile(file);
    
    setError(null);
    setSuccessMessage('Image selected. Click Save to upload and update the experiment.');
  };

  const handleRemoveExperimentImage = async () => {
    if (!experiment) return;

    if (!confirm('Are you sure you want to remove the experiment image?')) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Update the experiment to remove the image
      const updatedExperiment = {
        ...experiment,
        experimentImageId: undefined,
        posterImage: undefined
      };

      await handleSave(updatedExperiment);
      setExperiment(updatedExperiment);
      setSuccessMessage('Experiment image removed successfully!');

    } catch (err) {
      console.error('Failed to remove experiment image:', err);
      setError(`Failed to remove image: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-secondary-600">Loading experiment...</span>
      </div>
    );
  }

  if (error && !experiment) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to={`/experiments/${experiment.id}`}>
            <Button variant="secondary" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Experiment
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">
              Edit Experiment #{experiment.number.toString().padStart(3, '0')}
            </h1>
            <p className="text-secondary-600 mt-1">Make changes to your experiment</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isSaving}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">⚠️ {error}</p>
        </div>
      )}

      {/* Success Display */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-600">✅ {successMessage}</p>
        </div>
      )}

      {/* Edit Form */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
        <h2 className="text-xl font-semibold text-secondary-900 mb-6">Experiment Details</h2>
        
        {/* COMPACT GRID LAYOUT - More efficient use of space */}
        <div className="space-y-6">
          {/* Row 1: Title and Date - 2 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Title</label>
              <Input
                value={experiment.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  const newNumber = parseInt(newTitle.match(/Experiment #(\d+)/)?.[1] || experiment.number.toString()) || experiment.number;
                  
                  setExperiment({ 
                    ...experiment, 
                    title: newTitle,
                    number: newNumber 
                  });
                  setError(null);
                  setSuccessMessage(null);
                }}
                placeholder="Experiment title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Date</label>
              <Input
                type="date"
                value={experiment.date}
                onChange={(e) => {
                  setExperiment({ ...experiment, date: e.target.value });
                  setError(null);
                  setSuccessMessage(null);
                }}
              />
            </div>
          </div>

          {/* Row 2: Experiment Number, Permalink Slug, Host - 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Experiment Number</label>
              <Input
                value={experiment.number.toString().padStart(3, '0')}
                onChange={(e) => {
                  const newNumber = parseInt(e.target.value) || 1;
                  const newTitle = `Experiment #${newNumber.toString().padStart(3, '0')}`;
                  const newSlug = `experiment-${newNumber.toString().padStart(3, '0')}`;
                  
                  setExperiment({ 
                    ...experiment, 
                    number: newNumber,
                    title: newTitle,
                    slug: newSlug
                  });
                  setError(null);
                  setSuccessMessage(null);
                }}
                placeholder="001"
                className="font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Permalink Slug</label>
              <Input
                value={experiment.slug || `experiment-${experiment.number.toString().padStart(3, '0')}`}
                onChange={(e) => {
                  setExperiment({ ...experiment, slug: e.target.value });
                  setError(null);
                  setSuccessMessage(null);
                }}
                placeholder="experiment-001"
                className="font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Host</label>
              {isLoadingUsers ? (
                <div className="w-full rounded-lg border-secondary-300 shadow-sm p-3 bg-secondary-50">
                  <div className="animate-pulse flex items-center">
                    <div className="h-4 w-4 bg-secondary-300 rounded mr-2"></div>
                    <div className="h-4 bg-secondary-300 rounded w-24"></div>
                  </div>
                </div>
              ) : userLoadError ? (
                <div className="w-full rounded-lg border-red-300 shadow-sm p-3 bg-red-50 text-red-700 text-sm">
                  Error loading users
                </div>
              ) : (
                <select
                  value={experiment.hostId}
                  onChange={(e) => {
                    setExperiment({ ...experiment, hostId: parseInt(e.target.value) });
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="block w-full rounded-lg border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  disabled={users.length === 0}
                >
                  {users.length === 0 ? (
                    <option value="">No users available</option>
                  ) : (
                    users.map(user => (
                      <option key={user.id} value={user.id}>
                        {getUserDisplayName(user)} ({getUserUsername(user)})
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>
          </div>

          {/* Row 3: Event Platforms - Compact grid */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-3">Event Platforms</label>
            {isLoadingPlatforms ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="animate-pulse flex items-center">
                    <div className="h-4 w-4 bg-secondary-300 rounded mr-2"></div>
                    <div className="h-4 bg-secondary-300 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            ) : platformLoadError ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">Error loading platforms: {platformLoadError}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {platforms.map(platform => (
                  <label key={platform.id} className="flex items-center p-2 rounded-lg hover:bg-secondary-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={experiment.platforms.some(p => p.name === platform.name)}
                      onChange={() => handlePlatformToggle(platform.id)}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-secondary-700 truncate">
                      {platform.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
            {platforms.length > 0 && (
              <p className="text-xs text-secondary-500 mt-2">Select the platforms where this experiment will take place</p>
            )}
          </div>

          {/* Row 4: Notes and Image Upload - 2 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Notes</label>
              <textarea
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={4}
                value={experiment.notes || ''}
                onChange={(e) => {
                  setExperiment({ ...experiment, notes: e.target.value });
                  setError(null);
                  setSuccessMessage(null);
                }}
                placeholder="Add notes about this experiment..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Experiment Image (Optional)</label>
              <div className="space-y-3">
                {experiment.posterImage && (
                  <div className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg">
                    <img
                      src={experiment.posterImage}
                      alt="Current experiment image"
                      className="w-16 h-16 object-cover rounded-lg border border-secondary-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-secondary-600 truncate">Current image</p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRemoveExperimentImage()}
                        className="mt-1"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
                
                {pendingImageFile && (
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <img
                      src={URL.createObjectURL(pendingImageFile)}
                      alt="Pending experiment image"
                      className="w-16 h-16 object-cover rounded-lg border border-blue-300"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-blue-700 font-medium">New image selected</p>
                      <p className="text-xs text-blue-600">Will upload on save</p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPendingImageFile(null)}
                        className="mt-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleExperimentImageChange}
                    className="block w-full text-sm text-secondary-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  <p className="text-xs text-secondary-500 mt-1">Max 5MB • JPG, PNG, GIF, WebP</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Movies Section */}
        <div className="mt-8 pt-6 border-t border-secondary-200">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-4">
              Movies ({experiment.movies.length})
            </label>
            <div className="space-y-2">
              {experiment.movies.map((movie) => (
                <div 
                  key={movie.id} 
                  className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 cursor-pointer transition-colors"
                  onClick={() => handleMovieClick(movie)}
                >
                  <div className="flex items-center space-x-3">
                    {movie.posterPath && (
                      <img
                        src={movie.posterPath}
                        alt={movie.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="font-medium">{movie.title}</p>
                      <p className="text-sm text-secondary-500">
                        {new Date(movie.releaseDate).getFullYear()} • {movie.runtime} min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMovieClick(movie);
                      }}
                      className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
                      title="Edit movie"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMovie(movie);
                      }}
                      className="p-2 text-red-400 hover:text-red-600 transition-colors"
                      title="Remove movie from experiment"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-secondary-200 flex items-center justify-between">
          <div className="text-sm text-secondary-500">
            Changes are saved to WordPress
          </div>
          <div className="flex items-center space-x-4">
            <Link to={`/experiments/${experiment.id}`}>
              <Button variant="secondary">
                Cancel
              </Button>
            </Link>
            <Button
              onClick={() => handleSave(experiment)}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Movie Edit Modal */}
      <MovieEditModal
        movie={selectedMovie}
        isOpen={isMovieModalOpen}
        onClose={handleCloseMovieModal}
        onSave={handleMovieSave}
      />
    </div>
  );
};

export default ExperimentEdit;
