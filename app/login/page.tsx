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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <div className="text-lg text-zinc-600 dark:text-zinc-400">Chargement...</div>
        </div>
      </div>
    );
  }

  if (isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <div className="text-lg text-zinc-600 dark:text-zinc-400">Connexion au serveur...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-zinc-900">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-semibold text-black dark:text-zinc-50">
            Connexion
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Connectez-vous avec votre compte Microsoft Azure
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Erreur :</strong> {error}
            </p>
          </div>
        )}

        <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-4 dark:bg-blue-900/20 dark:border-blue-800">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>Note :</strong> Assurez-vous que le serveur backend est démarré sur le port 3000.
            Si vous voyez une page blanche après avoir cliqué, le backend n'est probablement pas démarré.
          </p>
        </div>

        <button
          onClick={handleLogin}
          disabled={isRedirecting}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Se connecter avec Microsoft
        </button>

        <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-500">
          Vous serez redirigé vers Microsoft pour vous authentifier
        </p>
      </div>
    </div>
  );
}

