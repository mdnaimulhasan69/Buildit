import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useAlert } from '../components/AlertBanner.tsx';
import { apiFetch, getStoredToken } from '../lib/api-client.ts';
import { validateRequired } from '../lib/validation.ts';
import { GoogleSignInButton } from '../components/GoogleSignInButton.tsx';
import { Layout, Lock, Mail } from 'lucide-react';

interface LoginPageProps {
  navigate: (path: string) => void;
  redirectTo?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate, redirectTo }) => {
  const { loginUser } = useAuth();
  const { showSuccess, showError } = useAlert();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setGeneralError(null);
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleGoogleClick = () => {
    showError('Google sign-in is not set up yet');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const newErrors: Record<string, string> = {};

    const emailCheck = validateRequired(formData.email);
    if (!emailCheck.valid) {
      newErrors.email = 'This field is required';
    }

    const passCheck = validateRequired(formData.password);
    if (!passCheck.valid) {
      newErrors.password = 'This field is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    const res = await apiFetch<{
      success: boolean;
      token: string;
      user: any;
      error?: string;
      field?: string;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(formData)
    });

    setIsSubmitting(false);

    if (!res.ok) {
      if (res.field && res.error) {
        setErrors((prev) => ({ ...prev, [res.field!]: res.error! }));
      } else if (res.error) {
        setGeneralError(res.error);
        showError(res.error);
      }
      return;
    }

    if (res.data?.token && res.data?.user) {
      loginUser(res.data.token, res.data.user);
      showSuccess('Logged in successfully');
      // Requirement 3.7: Return to the intended protected page or /dashboard
      const destination = redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard';
      navigate(destination);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Layout className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Log in to BuildIt
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
          >
            create a new account
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 sm:rounded-xl sm:px-10">
          {/* Continue with Google button (Part 2D) */}
          <GoogleSignInButton
            text="signin_with"
            onSuccess={(googleUser) => {
              loginUser(getStoredToken() || '', googleUser);
              showSuccess('Logged in successfully');
              const destination = redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard';
              navigate(destination);
            }}
            onError={(msg) => {
              setGeneralError(msg);
              showError(msg);
            }}
          />

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-500 font-medium">Or log in with email</span>
            </div>
          </div>

          {generalError && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700" role="alert">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            {/* Field: Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.email ? 'border-red-400 text-red-900 bg-red-50/20' : 'border-gray-300 text-gray-900'
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 font-medium" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Field: Password */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.password ? 'border-red-400 text-red-900 bg-red-50/20' : 'border-gray-300 text-gray-900'
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 font-medium" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Starting up, please wait' : 'Log in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
