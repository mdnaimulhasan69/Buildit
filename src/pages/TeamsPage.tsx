import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Users } from 'lucide-react';

interface TeamsPageProps {
  navigate: (path: string) => void;
}

export const TeamsPage: React.FC<TeamsPageProps> = ({ navigate }) => {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login?redirect=/teams');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-gray-500 text-sm">
        Starting up, please wait
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Teams</h1>
          <p className="mt-1 text-sm text-gray-600">
            Collaborate with other students and teammates in real time.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            You are not in any team yet.
          </h2>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
