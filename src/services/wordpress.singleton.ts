import { config } from '../utils/config';
import WordPressService from '../services/wordpress.service';

class WordPressServiceSingleton {
  private static instance: WordPressService | null = null;

  public static getInstance(): WordPressService {
    if (!WordPressServiceSingleton.instance) {
      if (!config.wordpress) {
        throw new Error('WordPress configuration not found');
      }
      WordPressServiceSingleton.instance = new WordPressService(config.wordpress);
    }
    return WordPressServiceSingleton.instance;
  }

  public static resetInstance(): void {
    WordPressServiceSingleton.instance = null;
  }
}

export default WordPressServiceSingleton;
