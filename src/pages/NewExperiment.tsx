import { ExperimentForm } from '../components/experiment';
import type { ExperimentFormData, EventPlatform } from '../types';
import WordPressServiceSingleton from '../services/wordpress.singleton';

const NewExperiment: React.FC = () => {
  const wordpressService = WordPressServiceSingleton.getInstance();

  const handleSave = async (experimentData: ExperimentFormData) => {
    console.log('Saving experiment:', experimentData);
    
    try {
      // Get platform objects for the selected platform IDs
      const allPlatforms = await wordpressService.getEventPlatforms();
      const selectedPlatforms = allPlatforms.filter(platform => 
        experimentData.platformIds.includes(platform.id)
      );

      // Upload experiment image if provided
      let experimentImageId: number | undefined;
      if (experimentData.posterImage) {
        console.log('Uploading experiment image...');
        const filename = `experiment-${experimentData.experimentNumber}-${Date.now()}.${experimentData.posterImage.name.split('.').pop()}`;
        const uploadResult = await wordpressService.uploadImage(experimentData.posterImage, filename);
        experimentImageId = uploadResult.thumbnail.id; // Use the uploaded image ID
        console.log('Experiment image uploaded with ID:', experimentImageId);
      }

      // Convert ExperimentFormData to Experiment format
      const experimentToSave = {
        title: experimentData.title,
        number: parseInt(experimentData.experimentNumber), // Convert string to number
        slug: experimentData.slug,
        date: experimentData.date,
        hostId: experimentData.hostId,
        platforms: selectedPlatforms,
        notes: experimentData.notes,
        experimentImageId: experimentImageId, // Add the uploaded image ID
        // movies will be handled later when movie relationships are implemented
      };

      console.log('Converted experiment data:', experimentToSave);
      
      const savedExperiment = await wordpressService.saveExperiment(experimentToSave);
      console.log('Experiment saved successfully:', savedExperiment);
      
    } catch (error) {
      console.error('Error saving experiment:', error);
    }
  };

  return <ExperimentForm onSave={handleSave} />;
};

export default NewExperiment;
