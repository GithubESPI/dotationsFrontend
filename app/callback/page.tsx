'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCallback = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      // Récupérer le token depuis l'URL
      const token = searchParams.get('token');
      
      if (!token) {
        // Essayer de récupérer depuis le hash de l'URL (si le backend l'envoie ainsi)
        if (typeof window !== 'undefined') {
          const hash = window.location.hash.substring(1);
          const params = new URLSearchParams(hash);
          const hashToken = params.get('token');
          
          if (hashToken) {
            await authService.handleCallback(hashToken);
            await refreshUser();
            router.push('/');
            return;
          }
        }
        
        throw new Error('Token manquant dans l\'URL');
      }

      // Traiter le callback avec le token
      await authService.handleCallback(token);
      await refreshUser();
      
      // Rediriger vers la page d'accueil
      router.push('/');
    } catch (err: any) {
      console.error('Erreur lors du callback:', err);
      setError(err.message || 'Erreur lors de l\'authentification');
      // Rediriger vers la page de login après 3 secondes
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <div className="text-lg text-zinc-600 dark:text-zinc-400">
            Authentification en cours...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-zinc-900">
          <div className="mb-4 text-center">
            <div className="mb-2 text-2xl">❌</div>
            <h1 className="mb-2 text-2xl font-semibold text-red-600 dark:text-red-400">
              Erreur d'authentification
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">{error}</p>
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-500">
              Redirection vers la page de connexion...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
            <div className="text-lg text-zinc-600 dark:text-zinc-400">
              Chargement...
            </div>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}

