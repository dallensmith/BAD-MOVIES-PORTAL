import { useState, useEffect } from 'react';
import { Settings, Database, Key, Bell, Shield, Check } from 'lucide-react';
import { Button } from '../components/ui';

const SettingsPage: React.FC = () => {
  // State for WordPress configuration
  const [wordpressConfig, setWordpressConfig] = useState({
    url: '',
    apiUrl: '',
  });

  // State for saving
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load configuration on mount
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('wordpress_config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setWordpressConfig({
          url: parsed.url || '',
          apiUrl: parsed.apiUrl || '',
        });
      } else {
        // Set defaults from environment
        setWordpressConfig({
          url: import.meta.env.VITE_WORDPRESS_URL || '',
          apiUrl: import.meta.env.VITE_WORDPRESS_API_URL || '',
        });
      }
    } catch (error) {
      console.error('Failed to load WordPress configuration:', error);
      // Fallback to environment variables
      setWordpressConfig({
        url: import.meta.env.VITE_WORDPRESS_URL || '',
        apiUrl: import.meta.env.VITE_WORDPRESS_API_URL || '',
      });
    }
  }, []);

  const handleWordpressConfigChange = (field: string, value: string) => {
    setWordpressConfig(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveWordpressConfig = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('wordpress_config', JSON.stringify(wordpressConfig));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // Reload the page to apply the new configuration
      window.location.reload();
    } catch (error) {
      console.error('Failed to save WordPress configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isWordpressConfigured = () => {
    return wordpressConfig.url && wordpressConfig.apiUrl && 
           wordpressConfig.url !== 'http://localhost:8080';
  };
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Settings</h1>
        <p className="text-secondary-600 mt-1">
          Configure your Bad Movies Portal preferences and integrations
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* TMDb Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Database className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-secondary-900 ml-3">
              TMDb Integration
            </h2>
          </div>
          <p className="text-secondary-600 mb-4">
            Configure your The Movie Database API settings for fetching movie data.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                API Key
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="password"
                  placeholder="Your TMDb API key"
                  className="flex-1 rounded-lg border-secondary-300 focus:border-primary-500 focus:ring-primary-500"
                  value="••••••••••••••••"
                  readOnly
                />
                <button className="px-3 py-2 text-sm bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors">
                  Update
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-green-700">✅ Connection verified</span>
              <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                Test Connection
              </button>
            </div>
          </div>
        </div>

        {/* WordPress Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-accent-100 rounded-lg">
              <Key className="w-6 h-6 text-accent-600" />
            </div>
            <h2 className="text-xl font-semibold text-secondary-900 ml-3">
              WordPress Integration
            </h2>
          </div>
          <p className="text-secondary-600 mb-4">
            Configure your WordPress connection for data persistence and content management.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                WordPress URL
              </label>
              <input
                type="url"
                placeholder="https://your-wordpress-site.com"
                className="w-full rounded-lg border-secondary-300 focus:border-primary-500 focus:ring-primary-500"
                value={wordpressConfig.url}
                onChange={(e) => handleWordpressConfigChange('url', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                API Endpoint
              </label>
              <input
                type="url"
                placeholder="https://your-wordpress-site.com/wp-json/wp/v2"
                className="w-full rounded-lg border-secondary-300 focus:border-primary-500 focus:ring-primary-500"
                value={wordpressConfig.apiUrl}
                onChange={(e) => handleWordpressConfigChange('apiUrl', e.target.value)}
              />
            </div>
            
            {/* Save Button */}
            <div className="flex items-center justify-between pt-2">
              <Button
                onClick={handleSaveWordpressConfig}
                disabled={isSaving}
                isLoading={isSaving}
                variant="primary"
                size="sm"
              >
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </Button>
              
              {saveSuccess && (
                <span className="text-sm text-green-600 flex items-center">
                  <Check className="w-4 h-4 mr-1" />
                  Configuration saved!
                </span>
              )}
            </div>
            
            {/* Connection Status */}
            <div className={`flex items-center justify-between p-3 rounded-lg ${
              isWordpressConfigured() 
                ? 'bg-green-50' 
                : 'bg-yellow-50'
            }`}>
              <span className={`text-sm ${
                isWordpressConfigured() 
                  ? 'text-green-700' 
                  : 'text-yellow-700'
              }`}>
                {isWordpressConfigured() 
                  ? '✅ Configuration updated' 
                  : '⚠️ Using default configuration'
                }
              </span>
              <button className={`text-sm font-medium ${
                isWordpressConfigured() 
                  ? 'text-green-600 hover:text-green-700' 
                  : 'text-yellow-600 hover:text-yellow-700'
              }`}>
                Test Connection
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Bell className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-secondary-900 ml-3">
              Notifications
            </h2>
          </div>
          <p className="text-secondary-600 mb-4">
            Configure when and how you receive notifications about experiments and processing.
          </p>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                defaultChecked
              />
              <span className="ml-3 text-sm text-secondary-700">
                Experiment processing completed
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                defaultChecked
              />
              <span className="ml-3 text-sm text-secondary-700">
                Processing errors
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-3 text-sm text-secondary-700">
                Weekly summary reports
              </span>
            </label>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-secondary-900 ml-3">
              Security
            </h2>
          </div>
          <p className="text-secondary-600 mb-4">
            Manage your account security and access permissions.
          </p>
          <div className="space-y-4">
            <button className="w-full text-left p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors">
              <div className="font-medium text-secondary-900">Change Password</div>
              <div className="text-sm text-secondary-500">Update your account password</div>
            </button>
            <button className="w-full text-left p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors">
              <div className="font-medium text-secondary-900">Two-Factor Authentication</div>
              <div className="text-sm text-secondary-500">Add an extra layer of security</div>
            </button>
            <button className="w-full text-left p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors">
              <div className="font-medium text-secondary-900">Active Sessions</div>
              <div className="text-sm text-secondary-500">Manage your logged-in devices</div>
            </button>
          </div>
        </div>
      </div>

      {/* Application Info */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-secondary-100 rounded-lg">
            <Settings className="w-6 h-6 text-secondary-600" />
          </div>
          <h2 className="text-xl font-semibold text-secondary-900 ml-3">
            Application Information
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm font-medium text-secondary-700">Version</div>
            <div className="text-lg font-mono text-secondary-900">1.0.0</div>
          </div>
          <div>
            <div className="text-sm font-medium text-secondary-700">Environment</div>
            <div className="text-lg text-secondary-900">Development</div>
          </div>
          <div>
            <div className="text-sm font-medium text-secondary-700">Last Updated</div>
            <div className="text-lg text-secondary-900">June 14, 2025</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
