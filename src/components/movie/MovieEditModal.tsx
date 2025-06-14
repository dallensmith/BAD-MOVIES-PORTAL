import React, { useState, useEffect } from 'react';
import { X, Save, ExternalLink, Calendar, Clock, DollarSign, Star, Users, Link as LinkIcon } from 'lucide-react';
import { Button, Input, Modal } from '../ui';
import { generateAmazonAffiliateLink, validateAndAddAffiliateTag, isAmazonUrl } from '../../utils/amazon';
import type { Movie } from '../../types';

interface MovieEditModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMovie: Movie) => void;
}

const MovieEditModal: React.FC<MovieEditModalProps> = ({
  movie,
  isOpen,
  onClose,
  onSave,
}) => {
  const [editedMovie, setEditedMovie] = useState<Movie | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (movie) {
      setEditedMovie({ ...movie });
    } else {
      setEditedMovie(null);
    }
  }, [movie]);

  const handleSave = async () => {
    if (!editedMovie) return;

    setIsSaving(true);
    try {
      onSave(editedMovie);
      onClose();
    } catch (error) {
      console.error('Failed to save movie:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof Movie, value: string | number) => {
    if (!editedMovie) return;

    let processedValue = value;
    
    // Auto-process Amazon links to add affiliate tag
    if (field === 'amazonLink' && typeof value === 'string' && value.trim() && isAmazonUrl(value)) {
      processedValue = validateAndAddAffiliateTag(value);
    }

    setEditedMovie({
      ...editedMovie,
      [field]: processedValue,
    });
  };

  const handleGenerateAmazonLink = () => {
    if (!editedMovie) return;
    
    const affiliateLink = generateAmazonAffiliateLink(editedMovie);
    if (affiliateLink) {
      setEditedMovie({
        ...editedMovie,
        amazonLink: affiliateLink,
      });
    }
  };

  if (!movie || !editedMovie) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {editedMovie.posterPath && (
              <img
                src={editedMovie.posterPath}
                alt={editedMovie.title}
                className="w-16 h-24 object-cover rounded-lg shadow-md"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold text-secondary-900">Edit Movie</h2>
              <p className="text-secondary-600">Update movie information</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Movie Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Title
              </label>
              <Input
                value={editedMovie.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Movie title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Original Title
              </label>
              <Input
                value={editedMovie.originalTitle || ''}
                onChange={(e) => handleInputChange('originalTitle', e.target.value)}
                placeholder="Original title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Release Date
              </label>
              <Input
                type="date"
                value={editedMovie.releaseDate}
                onChange={(e) => handleInputChange('releaseDate', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Runtime (minutes)
              </label>
              <Input
                type="number"
                value={editedMovie.runtime || ''}
                onChange={(e) => handleInputChange('runtime', parseInt(e.target.value) || 0)}
                placeholder="Runtime in minutes"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Content Rating
              </label>
              <Input
                value={editedMovie.contentRating || ''}
                onChange={(e) => handleInputChange('contentRating', e.target.value)}
                placeholder="e.g., PG-13, R, NC-17"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Tagline
              </label>
              <Input
                value={editedMovie.tagline || ''}
                onChange={(e) => handleInputChange('tagline', e.target.value)}
                placeholder="Movie tagline"
              />
            </div>
          </div>

          {/* Right Column - Additional Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Additional Details</h3>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Overview
              </label>
              <textarea
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={4}
                value={editedMovie.overview || ''}
                onChange={(e) => handleInputChange('overview', e.target.value)}
                placeholder="Movie description/plot summary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Budget
                </label>
                <Input
                  type="number"
                  value={editedMovie.budget || ''}
                  onChange={(e) => handleInputChange('budget', parseInt(e.target.value) || 0)}
                  placeholder="Budget in USD"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Revenue
                </label>
                <Input
                  type="number"
                  value={editedMovie.revenue || ''}
                  onChange={(e) => handleInputChange('revenue', parseInt(e.target.value) || 0)}
                  placeholder="Box office revenue"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  <Star className="w-4 h-4 inline mr-1" />
                  TMDb Rating
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={editedMovie.voteAverage || ''}
                  onChange={(e) => handleInputChange('voteAverage', parseFloat(e.target.value) || 0)}
                  placeholder="0.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Vote Count
                </label>
                <Input
                  type="number"
                  value={editedMovie.voteCount || ''}
                  onChange={(e) => handleInputChange('voteCount', parseInt(e.target.value) || 0)}
                  placeholder="Number of votes"
                />
              </div>
            </div>

            {/* External Links */}
            <div className="space-y-2">
              <h4 className="text-md font-medium text-secondary-800">External Links</h4>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Amazon Link
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="url"
                    value={editedMovie.amazonLink || ''}
                    onChange={(e) => handleInputChange('amazonLink', e.target.value)}
                    placeholder="https://amazon.com/..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleGenerateAmazonLink}
                    className="whitespace-nowrap"
                  >
                    <LinkIcon className="w-4 h-4 mr-1" />
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-secondary-500 mt-1">
                  Generate an Amazon Video search link or paste any Amazon URL (affiliate tag will be added automatically)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Trailer URL
                </label>
                <Input
                  type="url"
                  value={editedMovie.trailerUrl || ''}
                  onChange={(e) => handleInputChange('trailerUrl', e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              {/* Read-only external links */}
              {(editedMovie.tmdbId || editedMovie.imdbId || editedMovie.amazonLink || editedMovie.trailerUrl) && (
                <div className="pt-2 border-t border-secondary-200">
                  <h5 className="text-sm font-medium text-secondary-700 mb-2">External References</h5>
                  <div className="flex flex-wrap gap-2">
                    {editedMovie.tmdbId && (
                      <a
                        href={`https://www.themoviedb.org/movie/${editedMovie.tmdbId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                      >
                        TMDb <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                    {editedMovie.imdbId && (
                      <a
                        href={`https://www.imdb.com/title/${editedMovie.imdbId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200"
                      >
                        IMDb <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                    {editedMovie.amazonLink && (
                      <a
                        href={editedMovie.amazonLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200"
                      >
                        Amazon <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                    {editedMovie.trailerUrl && (
                      <a
                        href={editedMovie.trailerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                      >
                        Trailer <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-secondary-200">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
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
    </Modal>
  );
};

export default MovieEditModal;
