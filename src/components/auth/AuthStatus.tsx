import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import WordPressServiceSingleton from '../../services/wordpress.singleton';

interface LoginForm {
  username: string;
  password: string;
}

export const AuthStatus: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState<LoginForm>({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [wordpressService] = useState(() => WordPressServiceSingleton.getInstance());

  useEffect(() => {
    // Check if already authenticated
    setTimeout(() => {
      setIsAuthenticated(wordpressService.isAuthenticated());
    }, 1000); // Give time for auto-auth to complete
  }, [wordpressService]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      // First try JWT authentication
      try {
        await wordpressService.login(loginForm);
        console.log('Login successful with JWT');
      } catch {
        // If JWT fails, try basic auth
        console.log('JWT login failed, trying Basic Auth...');
        const basicAuthSuccess = await wordpressService.loginWithBasicAuth(loginForm);
        if (!basicAuthSuccess) {
          throw new Error('Both JWT and Basic Auth failed');
        }
        console.log('Login successful with Basic Auth');
      }
      
      setIsAuthenticated(true);
      setShowLoginModal(false);
      setLoginForm({ username: '', password: '' });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    wordpressService.clearAuth();
    setIsAuthenticated(false);
  };

  const handleInputChange = (field: keyof LoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="flex items-center gap-2">
      {isAuthenticated ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-green-600 font-medium">✓ Authenticated</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm text-red-600 font-medium">⚠ Not authenticated</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowLoginModal(true)}
          >
            Login
          </Button>
        </div>
      )}

      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="WordPress Login"
      >
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Username"
            value={loginForm.username}
            onChange={handleInputChange('username')}
            required
            disabled={loading}
          />
          <Input
            label="Password"
            type="password"
            value={loginForm.password}
            onChange={handleInputChange('password')}
            required
            disabled={loading}
          />
          
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowLoginModal(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={loading}
            >
              Login
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
