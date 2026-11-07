/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { AlertProvider } from './components/AlertBanner.tsx';
import { Navbar } from './components/Navbar.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { TeamsPage } from './pages/TeamsPage.tsx';
import { EditorPage } from './pages/EditorPage.tsx';
import { LivePreviewPage } from './pages/LivePreviewPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { PublicProfilePage } from './pages/PublicProfilePage.tsx';
import { TemplatesPage } from './pages/TemplatesPage.tsx';
import { ShowcasePage } from './pages/ShowcasePage.tsx';

function MainRouter() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [searchParams, setSearchParams] = useState<string>(() => {
    return window.location.search || '';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      setSearchParams(window.location.search || '');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    const [pathPart, queryPart] = to.split('?');
    window.history.pushState({}, '', to);
    setCurrentPath(pathPart || '/');
    setSearchParams(queryPart ? `?${queryPart}` : '');
    window.scrollTo(0, 0);
  };

  // Extract redirect query parameter if any
  const redirectParam = new URLSearchParams(searchParams).get('redirect') || undefined;

  let pageContent = null;
  // The home page and the showcase pages bring their own top bar, so the shared Navbar is hidden there.
  let ownNav = false;
  if (currentPath === '/' || currentPath === '') {
    pageContent = <HomePage navigate={navigate} />;
    ownNav = true;
  } else if (currentPath === '/showcase' || currentPath === '/showcase/') {
    pageContent = <ShowcasePage navigate={navigate} />;
    ownNav = true;
  } else if (currentPath.startsWith('/showcase/')) {
    const demoSlug = decodeURIComponent(currentPath.replace('/showcase/', '').replace(/\/$/, ''));
    pageContent = <ShowcasePage slug={demoSlug} navigate={navigate} />;
    ownNav = true;
  } else if (currentPath === '/register') {
    pageContent = <RegisterPage navigate={navigate} />;
  } else if (currentPath === '/login') {
    pageContent = <LoginPage navigate={navigate} redirectTo={redirectParam} />;
  } else if (currentPath === '/dashboard') {
    pageContent = <DashboardPage navigate={navigate} />;
  } else if (currentPath === '/profile') {
    pageContent = <ProfilePage navigate={navigate} />;
  } else if (currentPath.startsWith('/u/')) {
    const targetUserId = currentPath.replace('/u/', '');
    pageContent = <PublicProfilePage userId={targetUserId} navigate={navigate} />;
  } else if (currentPath.startsWith('/profile/')) {
    const targetUserId = currentPath.replace('/profile/', '');
    pageContent = <PublicProfilePage userId={targetUserId} navigate={navigate} />;
  } else if (currentPath === '/teams') {
    pageContent = <TeamsPage navigate={navigate} />;
  } else if (currentPath.startsWith('/editor/')) {
    const projectId = currentPath.replace('/editor/', '');
    pageContent = <EditorPage projectId={projectId} navigate={navigate} />;
  } else if (currentPath === '/templates') {
    pageContent = <TemplatesPage navigate={navigate} />;
  } else if (currentPath.startsWith('/templates/preview/')) {
    pageContent = <LivePreviewPage navigate={navigate} />;
  } else {
    // Fallback route: default to home
    pageContent = <HomePage navigate={navigate} />;
    ownNav = true;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-gray-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      {!ownNav && <Navbar currentPath={currentPath} navigate={navigate} />}
      <main className="flex-1 flex flex-col">{pageContent}</main>
    </div>
  );
}

// Shows a friendly message instead of a blank white page if a page fails to draw.
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('[BuildIt] A page failed to draw:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '24px',
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif',
            color: '#0f172a',
            background: '#f8fafc'
          }}
        >
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>Something went wrong on this page</h1>
          <p style={{ margin: 0, color: '#475569', maxWidth: '420px' }}>
            Your saved work is safe. Please go back to the home page and try again.
          </p>
          <button
            type="button"
            onClick={() => window.location.assign('/')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#2563eb',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Back to home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AlertProvider>
        <AuthProvider>
          <MainRouter />
        </AuthProvider>
      </AlertProvider>
    </ErrorBoundary>
  );
}
