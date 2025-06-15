import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Image, Save, Plus } from 'lucide-react';
import { Button, Input, Modal, ProgressBar } from '../ui';
import ProgressTracker from '../ui/ProgressTracker';
import { MovieSearchModal, MovieList } from '../movie';
import { clsx } from 'clsx';
import WordPressServiceSingleton from '../../services/wordpress.singleton';
import MoviePreFetchService from '../../services/movie-prefetch.service';
import type { 
  ExperimentFormData, 
  MovieSelectionData, 
  EventPlatform, 
  WordPressUser,
  ProcessingStep
} from '../../types';
import type { ProgressStep } from '../../types/progress';

// Initialize services
const wordpressService = WordPressServiceSingleton.getInstance();

interface ExperimentFormProps {
  onSave?: (experiment: ExperimentFormData) => Promise<void>;
  isEditing?: boolean;
  preFetchService?: MoviePreFetchService;
}

const ExperimentForm: React.FC<ExperimentFormProps> = ({
  onSave,
  isEditing = false,
  preFetchService: providedPreFetchService,
}) => {
  const navigate = useNavigate();
  const [isMovieSearchOpen, setIsMovieSearchOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<MovieSelectionData[]>([]);
  
  // Use provided preFetchService or create a new one
  const preFetchService = providedPreFetchService || new MoviePreFetchService();
  
  // Progress tracking state
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [isProgressVisible, setIsProgressVisible] = useState(false);
  const [currentOperation, setCurrentOperation] = useState('');
  
  // WordPress data state
  const [users, setUsers] = useState<WordPressUser[]>([]);
  const [currentUser, setCurrentUser] = useState<WordPressUser | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [userLoadError, setUserLoadError] = useState<string | null>(null);

  // Platform state
  const [platforms, setPlatforms] = useState<EventPlatform[]>([]);
  const [isLoadingPlatforms, setIsLoadingPlatforms] = useState(true);
  const [platformLoadError, setPlatformLoadError] = useState<string | null>(null);

  // Helper function to safely get user display name
  const getUserDisplayName = (user: WordPressUser): string => {
    return user?.name || user?.displayName || user?.username || user?.login || `User ${user?.id || 'Unknown'}`;
  };

  // Helper function to safely get username
  const getUserUsername = (user: WordPressUser): string => {
    return user?.username || user?.login || user?.slug || 'no-username';
  };
  
  // Form data
  const [formData, setFormData] = useState<ExperimentFormData>({
    title: '',
    experimentNumber: '001', // Will be updated when we fetch the next number
    slug: 'experiment-001', // Will be updated when we fetch the next number
    date: new Date().toISOString().split('T')[0], // Today's date
    hostId: 1, // Will be updated when current user is loaded
    platformIds: [1, 2], // Default to Bigscreen VR and Discord
    notes: '',
    posterImage: undefined,
    movieIds: [],
  });

  // Auto-generate experiment number and title
  useEffect(() => {
    const loadNextExperimentNumber = async () => {
      if (!isEditing) {
        try {
          console.log('Loading next experiment number...');
          const nextNumber = await wordpressService.getNextExperimentNumber();
          const title = `Experiment #${nextNumber}`;
          const slug = `experiment-${nextNumber}`;
          
          console.log(`Setting experiment number to: ${nextNumber}, title to: ${title}, slug to: ${slug}`);
          
          setFormData(prev => ({
            ...prev,
            title,
            experimentNumber: nextNumber,
            slug,
          }));
        } catch (error) {
          console.warn('Failed to load next experiment number:', error);
          // Keep the default values if loading fails
        }
      }
    };

    loadNextExperimentNumber();
  }, [isEditing]);

  // Load WordPress users and current user
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingUsers(true);
        setIsLoadingPlatforms(true);
        setUserLoadError(null);
        setPlatformLoadError(null);

        // Load users, current user, and platforms in parallel
        const [allUsers, currentUserData, eventPlatforms] = await Promise.all([
          wordpressService.getUsers(),
          wordpressService.getCurrentUser(),
          wordpressService.getEventPlatforms()
        ]);

        setUsers(allUsers);
        setCurrentUser(currentUserData);
        setPlatforms(eventPlatforms);

        // Auto-select current user as host and default platforms
        const defaultPlatformIds = eventPlatforms.filter(p => p.isDefault).map(p => p.id);
        setFormData(prev => ({
          ...prev,
          hostId: currentUserData.id,
          platformIds: defaultPlatformIds
        }));

        console.log('Loaded WordPress users:', allUsers);
        console.log('First user structure:', allUsers[0]);
        console.log('Current user:', currentUserData);
        console.log('Loaded event platforms:', eventPlatforms);
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

  const handleInputChange = (field: keyof ExperimentFormData, value: string | number | number[]) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Auto-update title and slug when experiment number changes
      if (field === 'experimentNumber' && typeof value === 'string') {
        newData.title = `Experiment #${value}`;
        newData.slug = `experiment-${value}`;
      }

      return newData;
    });
  };

  const handlePlatformToggle = (platformId: number) => {
    setFormData(prev => ({
      ...prev,
      platformIds: prev.platformIds.includes(platformId)
        ? prev.platformIds.filter(id => id !== platformId)
        : [...prev.platformIds, platformId],
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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

      setFormData(prev => ({
        ...prev,
        posterImage: file,
      }));
    }
  };

  const handleMovieSelect = async (movie: MovieSelectionData) => {
    // Check if movie is already selected
    const exists = selectedMovies.find(m => m.tmdbId === movie.tmdbId);
    if (exists) return;

    // Add movie to selection first
    setSelectedMovies(prev => [...prev, movie]);
    setIsMovieSearchOpen(false);

    // Start pre-fetching movie data in the background
    console.log('Starting pre-fetch for movie:', movie.title);
    setCurrentOperation(`Pre-fetching data for "${movie.title}"`);
    setIsProgressVisible(true);
    
    const initialSteps: ProgressStep[] = [
      {
        id: `prefetch-${movie.tmdbId}`,
        title: `Pre-fetching "${movie.title}"`,
        status: 'active',
        progress: 0,
        total: 8,
        details: 'Starting enrichment process...'
      }
    ];
    
    setProgressSteps(initialSteps);

    try {
      await preFetchService.preFetchMovieData(
        movie,
        (progress) => {
          console.log('Pre-fetch progress:', progress);
          setProgressSteps(prev => prev.map(step => 
            step.id === `prefetch-${movie.tmdbId}` ? {
              ...step,
              status: progress.status === 'complete' ? 'completed' : 'active',
              progress: progress.progress,
              total: progress.total,
              details: progress.step
            } : step
          ));
        }
      );

      // Hide progress after successful completion
      setTimeout(() => {
        setIsProgressVisible(false);
        setProgressSteps([]);
      }, 2000);

    } catch (error) {
      console.error('Pre-fetch failed:', error);
      setProgressSteps(prev => prev.map(step => 
        step.id === `prefetch-${movie.tmdbId}` ? {
          ...step,
          status: 'error',
          details: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        } : step
      ));
      
      // Hide progress after error
      setTimeout(() => {
        setIsProgressVisible(false);
        setProgressSteps([]);
      }, 3000);
    }
  };

  const handleMovieRemove = (movieId: number) => {
    setSelectedMovies(prev => prev.filter(movie => movie.tmdbId !== movieId));
  };

  const handleSave = async () => {
    setIsProcessing(true);
    
    // Initialize progress steps for experiment submission
    const submissionSteps: ProcessingStep[] = [
      { id: 'validate', name: 'Validating experiment data', status: 'pending' },
      { id: 'movies', name: 'Processing movie data', status: 'pending' },
      { id: 'images', name: 'Uploading images', status: 'pending' },
      { id: 'wordpress', name: 'Saving to WordPress', status: 'pending' },
      { id: 'complete', name: 'Finalizing experiment', status: 'pending' },
    ];
    
    setProcessingSteps(submissionSteps);

    try {
      // Step 1: Validate data
      setProcessingSteps(prev => prev.map(step => 
        step.id === 'validate' ? { ...step, status: 'in-progress' } : step
      ));
      
      // Basic validation
      if (!formData.title || !formData.experimentNumber) {
        throw new Error('Title and experiment number are required');
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setProcessingSteps(prev => prev.map(step => 
        step.id === 'validate' ? { ...step, status: 'completed' } : step
      ));

      // Step 2: Prepare movie data (use pre-fetched data where available)
      setProcessingSteps(prev => prev.map(step => 
        step.id === 'movies' ? { ...step, status: 'in-progress' } : step
      ));
      
      // Check which movies have been pre-fetched
      const preFetchedMovies = selectedMovies.filter(movie => 
        preFetchService.isMovieEnriched(movie.tmdbId)
      );
      const notPreFetchedMovies = selectedMovies.filter(movie => 
        !preFetchService.isMovieEnriched(movie.tmdbId)
      );
      
      console.log(`Using ${preFetchedMovies.length} pre-fetched movies, ${notPreFetchedMovies.length} need enrichment`);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      setProcessingSteps(prev => prev.map(step => 
        step.id === 'movies' ? { ...step, status: 'completed' } : step
      ));

      // Step 3: Handle image upload (simulated for now)
      setProcessingSteps(prev => prev.map(step => 
        step.id === 'images' ? { ...step, status: 'in-progress' } : step
      ));
      
      await new Promise(resolve => setTimeout(resolve, 600));
      setProcessingSteps(prev => prev.map(step => 
        step.id === 'images' ? { ...step, status: 'completed' } : step
      ));

      // Step 4: Save to WordPress
      setProcessingSteps(prev => prev.map(step => 
        step.id === 'wordpress' ? { ...step, status: 'in-progress' } : step
      ));

      const experimentData: ExperimentFormData = {
        ...formData,
        movieIds: selectedMovies.map(movie => movie.tmdbId),
        movieSelections: selectedMovies, // Pass the full movie selection data
      };

      if (onSave) {
        await onSave(experimentData);
      }
      
      setProcessingSteps(prev => prev.map(step => 
        step.id === 'wordpress' ? { ...step, status: 'completed' } : step
      ));

      // Step 5: Complete
      setProcessingSteps(prev => prev.map(step => 
        step.id === 'complete' ? { ...step, status: 'in-progress' } : step
      ));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setProcessingSteps(prev => prev.map(step => 
        step.id === 'complete' ? { ...step, status: 'completed' } : step
      ));

      // Navigate to experiment list or show success message
      setTimeout(() => {
        navigate('/experiments');
      }, 1500);

    } catch (error) {
      console.error('Error saving experiment:', error);
      
      // Mark current step as error
      setProcessingSteps(prev => prev.map(step => 
        step.status === 'in-progress' ? { ...step, status: 'error' } : step
      ));
      
      setIsProcessing(false);
      
      // Show error to user
      alert(`Error saving experiment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStepIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'in-progress':
        return '⏳';
      case 'error':
        return '❌';
      default:
        return '⏸️';
    }
  };

  const completedSteps = processingSteps.filter(step => step.status === 'completed').length;
  const progress = processingSteps.length > 0 ? (completedSteps / processingSteps.length) * 100 : 0;

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <h1 className="text-2xl font-bold text-secondary-900 mb-6">
            {isEditing ? 'Edit Experiment' : 'Create New Experiment'}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-secondary-900 flex items-center">
                <CalendarDays className="w-5 h-5 mr-2 text-primary-600" />
                Basic Information
              </h2>

              <Input
                label="Experiment Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Experiment #001"
              />

              <Input
                label="Experiment Number"
                value={formData.experimentNumber}
                onChange={(e) => handleInputChange('experimentNumber', e.target.value)}
                placeholder="001"
                className="font-mono"
              />

              <Input
                label="Permalink Slug"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="experiment-001"
                className="font-mono"
              />

              <Input
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-secondary-700">
                  Host
                </label>
                {isLoadingUsers ? (
                  <div className="block w-full rounded-lg border-secondary-300 shadow-sm p-3 bg-secondary-50">
                    <div className="animate-pulse flex items-center">
                      <div className="h-4 w-4 bg-secondary-300 rounded mr-2"></div>
                      <div className="h-4 bg-secondary-300 rounded w-24"></div>
                    </div>
                  </div>
                ) : userLoadError ? (
                  <div className="block w-full rounded-lg border-red-300 shadow-sm p-3 bg-red-50 text-red-700">
                    Error loading users: {userLoadError}
                  </div>
                ) : (
                  <select
                    value={formData.hostId}
                    onChange={(e) => handleInputChange('hostId', parseInt(e.target.value))}
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
                {currentUser && (
                  <p className="text-xs text-secondary-500 mt-1">
                    Currently logged in as: <span className="font-medium">{getUserDisplayName(currentUser)}</span>
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-secondary-700">
                  Event Platforms
                </label>
                {isLoadingPlatforms ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="animate-pulse flex items-center">
                        <div className="h-4 w-4 bg-secondary-300 rounded mr-3"></div>
                        <div className="h-4 bg-secondary-300 rounded w-24"></div>
                      </div>
                    ))}
                  </div>
                ) : platformLoadError ? (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">Error loading platforms: {platformLoadError}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {platforms.map(platform => (
                      <label key={platform.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.platformIds.includes(platform.id)}
                          onChange={() => handlePlatformToggle(platform.id)}
                          className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-3 text-sm text-secondary-700">
                          {platform.name}
                        </span>
                        {platform.description && (
                          <span className="ml-2 text-xs text-secondary-500">
                            - {platform.description}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
                {platforms.length > 0 && (
                  <p className="text-xs text-secondary-500 mt-2">
                    Select the platforms where this experiment will take place
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-secondary-700">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  className="block w-full rounded-lg border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Add any notes about this experiment..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-secondary-700">
                  Experiment Image (Optional)
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-secondary-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                    <p className="text-xs text-secondary-500 mt-1">
                      Upload an image for this experiment. Max size: 5MB. Supported formats: JPG, PNG, GIF, WebP
                    </p>
                  </div>
                  {formData.posterImage && (
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-secondary-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                          src={URL.createObjectURL(formData.posterImage)}
                          alt="Experiment preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Movie Selection */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-secondary-900 flex items-center">
                  <Image className="w-5 h-5 mr-2 text-primary-600" />
                  Movies
                </h2>
                <Button
                  onClick={() => setIsMovieSearchOpen(true)}
                  variant="secondary"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Movie
                </Button>
              </div>

              <MovieList
                movies={selectedMovies}
                onRemoveMovie={handleMovieRemove}
                isEditable={true}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-secondary-200">
            <div className="flex justify-end space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/experiments')}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={selectedMovies.length === 0 || isProcessing}
                isLoading={isProcessing}
              >
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Update Experiment' : 'Save Experiment'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Movie Search Modal */}
      <MovieSearchModal
        isOpen={isMovieSearchOpen}
        onClose={() => setIsMovieSearchOpen(false)}
        onSelectMovie={handleMovieSelect}
        selectedMovies={selectedMovies}
      />

      {/* Processing Modal */}
      <Modal
        isOpen={isProcessing}
        onClose={() => {}}
        title="Processing Experiment"
        showCloseButton={false}
        closeOnEscape={false}
        closeOnOverlayClick={false}
      >
        <div className="space-y-6">
          <ProgressBar
            progress={progress}
            color="primary"
            showPercentage={true}
            animated={true}
          />

          <div className="space-y-3">
            {processingSteps.map((step) => (
              <div
                key={step.id}
                className={clsx(
                  'flex items-center space-x-3 p-3 rounded-lg',
                  step.status === 'completed' && 'bg-green-50',
                  step.status === 'in-progress' && 'bg-blue-50',
                  step.status === 'error' && 'bg-red-50',
                  step.status === 'pending' && 'bg-secondary-50'
                )}
              >
                <span className="text-lg">
                  {getStepIcon(step.status)}
                </span>
                <span className={clsx(
                  'text-sm font-medium',
                  step.status === 'completed' && 'text-green-700',
                  step.status === 'in-progress' && 'text-blue-700',
                  step.status === 'error' && 'text-red-700',
                  step.status === 'pending' && 'text-secondary-500'
                )}>
                  {step.name}
                </span>
                {step.status === 'in-progress' && (
                  <div className="ml-auto">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {progress === 100 && (
            <div className="text-center py-4">
              <p className="text-green-600 font-medium">
                ✅ Experiment saved successfully!
              </p>
              <p className="text-sm text-secondary-500 mt-1">
                Redirecting to experiments list...
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* Progress Tracker for Movie Pre-fetching */}
      <ProgressTracker
        title={currentOperation || 'Processing'}
        steps={progressSteps}
        isVisible={isProgressVisible}
        onClose={() => setIsProgressVisible(false)}
      />
    </>
  );
};

export default ExperimentForm;
