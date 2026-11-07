import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useAlert } from '../components/AlertBanner.tsx';
import { apiFetch, getStoredToken } from '../lib/api-client.ts';
import { validateUserId, validateEmail, validatePassword, validateRequired } from '../lib/validation.ts';
import { GoogleSignInButton } from '../components/GoogleSignInButton.tsx';
import { Layout, Lock, Mail, User as UserIcon, Tag } from 'lucide-react';

interface RegisterPageProps {
  navigate: (path: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ navigate }) => {
  const { loginUser } = useAuth();
  const { showSuccess, showError } = useAlert();

  const [formData, setFormData] = useState({
    name: '',
    userId: '',
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field as user types
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleGoogleClick = () => {
    // Brief Requirement: Until Part 2D, clicking it only shows this message: “Google sign-in is not set up yet”.
    showError('Google sign-in is not set up yet');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    // 1. Name check
    const nameCheck = validateRequired(formData.name);
    if (!nameCheck.valid) {
      newErrors.name = 'This field is required';
    }

    // 2. User ID check
    const userIdCheck = validateUserId(formData.userId);
    if (!userIdCheck.valid) {
      newErrors.userId = userIdCheck.error || 'This field is required';
    }

    // 3. Email check
    const emailCheck = validateEmail(formData.email);
    if (!emailCheck.valid) {
      newErrors.email = emailCheck.error || 'This field is required';
    }

    // 4. Password check
    const passCheck = validatePassword(formData.password);
    if (!passCheck.valid) {
      newErrors.password = passCheck.error || 'This field is required';
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
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData)
    });

    setIsSubmitting(false);

    if (!res.ok) {
      if (res.field && res.error) {
        setErrors((prev) => ({ ...prev, [res.field!]: res.error! }));
      } else if (res.error) {
        showError(res.error);
      }
      return;
    }

    if (res.data?.token && res.data?.user) {
      // Requirement 2.7: After a successful registration, the system logs the new user in and opens the dashboard
      loginUser(res.data.token, res.data.user);
      showSuccess('Account created successfully');
      navigate('/dashboard');
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
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
          >
            Log in instead
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 sm:rounded-xl sm:px-10">
          {/* Continue with Google button (Part 2D) */}
          <GoogleSignInButton
            text="signup_with"
            onSuccess={(googleUser) => {
              loginUser(getStoredToken() || '', googleUser);
              showSuccess('Account registered successfully via Google');
              navigate('/dashboard');
            }}
            onError={(msg) => {
              showError(msg);
            }}
          />

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-500 font-medium">Or register with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            {/* Field: Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.name ? 'border-red-400 text-red-900 bg-red-50/20' : 'border-gray-300 text-gray-900'
                  }`}
                  placeholder="e.g. Naimul Hasan"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-600 font-medium" role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Field: User ID */}
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                User ID
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Tag className="h-4 w-4" />
                </div>
                <input
                  id="userId"
                  name="userId"
                  type="text"
                  value={formData.userId}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.userId ? 'border-red-400 text-red-900 bg-red-50/20' : 'border-gray-300 text-gray-900'
                  }`}
                  placeholder="e.g. naimul_cse"
                />
              </div>
              <p className="mt-1 text-[11px] text-gray-500">
                3 to 20 characters, letters, numbers, and &quot;_&quot; only.
              </p>
              {errors.userId && (
                <p className="mt-1 text-xs text-red-600 font-medium" role="alert">
                  {errors.userId}
                </p>
              )}
            </div>

            {/* Field: Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
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
              <p className="mt-1 text-[11px] text-gray-500">
                At least 8 characters with at least one letter and one number.
              </p>
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
                {isSubmitting ? 'Starting up, please wait' : 'Create account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
