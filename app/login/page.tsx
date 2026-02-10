'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Si déjà authentifié, rediriger vers le dashboard
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogin = () => {
    setError(null);
    setIsRedirecting(true);
    // Rediriger vers l'endpoint d'authentification du backend
    // Le backend gère toute la logique OAuth2 avec Azure AD
    // Note: Si vous voyez une page blanche, assurez-vous que le backend est démarré sur le port 3000
    login();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white mx-auto"></div>
          <div className="text-lg font-light tracking-wide animate-pulse">Chargement de l'expérience...</div>
        </div>
      </div>
    );
  }

  if (isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500 mx-auto"></div>
          <div className="text-lg font-light tracking-wide">Redirection sécurisée...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950">
      {/* Background Gradients & Effects */}
      <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl filter" />
      <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl filter" />

      {/* Glassmorph Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl sm:p-12">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-8 w-8 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white tracking-tight">
            Bienvenue
          </h1>
          <p className="text-zinc-400">
            Accédez à votre espace sécurisé
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 backdrop-blur-sm">
            <p className="text-sm font-medium text-red-400 text-center">
              {error}
            </p>
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isRedirecting}
          className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-[1px] shadow-lg transition-all hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="relative flex items-center justify-center rounded-xl bg-black/20 px-4 py-3.5 transition-all group-hover:bg-transparent">
            <span className="font-semibold text-white tracking-wide">Connexion Microsoft</span>
          </div>
        </button>

        <p className="mt-8 text-center text-xs text-zinc-500">
          Protégé par Azure Active Directory
        </p>
      </div>
    </div>
  );
}

