import React, { useState, useEffect, useRef } from 'react';
import { fetchGoogleAuthConfig, signInWithGoogleApi } from '../lib/api-client.ts';
import { AlertCircle, Loader2 } from 'lucide-react';

interface GoogleSignInButtonProps {
  onSuccess: (user: any) => void;
  onError: (error: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
}

declare global {
  interface Window {
    google?: any;
  }
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  text = 'continue_with'
}) => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<{ configured: boolean; clientId: string | null } | null>(null);
  const [showConfigHelp, setShowConfigHelp] = useState(false);
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    fetchGoogleAuthConfig().then(cfg => {
      if (mounted) {
        setConfig(cfg);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!config?.configured || !config.clientId) return;

    // Load Google Identity Services script if not already present
    const scriptId = 'google-gis-sdk';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const initializeGis = () => {
      if (window.google?.accounts?.id && buttonContainerRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: config.clientId,
            callback: async (response: any) => {
              if (response.credential) {
                setLoading(true);
                const res = await signInWithGoogleApi(response.credential);
                setLoading(false);
                if (res.ok && res.user) {
                  onSuccess(res.user);
                } else {
                  onError(res.error || 'Google sign-in failed');
                }
              }
            }
          });

          buttonContainerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(buttonContainerRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text
          });
        } catch (err: any) {
          console.error('GIS init error:', err);
        }
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGis;
      document.head.appendChild(script);
    } else if (window.google?.accounts?.id) {
      initializeGis();
    }
  }, [config, text, onSuccess, onError]);

  const handleFallbackClick = () => {
    if (!config?.configured) {
      setShowConfigHelp(true);
    }
  };

  return (
    <div className="w-full space-y-2">
      {config?.configured ? (
        <div className="relative">
          <div ref={buttonContainerRef} className="w-full flex justify-center min-h-[44px]" />
          {loading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={handleFallbackClick}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg border border-gray-300 shadow-2xs transition-all"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {text === 'signup_with'
                ? 'Sign up with Google'
                : text === 'signin_with'
                ? 'Sign in with Google'
                : 'Continue with Google'}
            </span>
          </button>

          {showConfigHelp && (
            <div className="mt-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong>Google Sign-In configuration required:</strong> Add your Google Cloud OAuth Client ID as{' '}
                <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[11px]">GOOGLE_CLIENT_ID</code> in{' '}
                <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[11px]">.env</code>. See{' '}
                <strong>SETUP_STEPS.md step 1</strong> for complete setup instructions.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
