'use client';
import React from 'react';
import Modal from '../ui/Modal';
import { SyncResponse } from '../../types/employee';

interface SyncResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: SyncResponse | null;
  error: Error | null;
  isLoading?: boolean;
  mode?: 'employees' | 'photos';
}

const SyncResultModal: React.FC<SyncResultModalProps> = ({
  isOpen,
  onClose,
  result,
  error,
  isLoading = false,
  mode = 'employees',
}) => {
  const isPhotos = mode === 'photos';

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? undefined : onClose}
      title={isPhotos ? "Résultat de la synchronisation des photos" : "Résultat de la synchronisation"}
      size="md"
      showCloseButton={!isLoading}
    >
      {isLoading ? (
        <div className="text-center py-8">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg animate-pulse">
              <svg
                className="w-8 h-8 text-white animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-black dark:text-zinc-50 mb-2">
            {isPhotos ? "Synchronisation des photos..." : "Synchronisation en cours..."}
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            {isPhotos
              ? "Veuillez patienter pendant la récupération des photos de profil"
              : "Veuillez patienter pendant la synchronisation des employés depuis Office 365"}
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
            Erreur lors de la synchronisation
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            {error.message || 'Une erreur est survenue lors de la synchronisation'}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
          >
            Fermer
          </button>
        </div>
      ) : result ? (
        <div className="space-y-6">
          {/* Icône de succès */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Titre */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-black dark:text-zinc-50 mb-2">
              Synchronisation terminée
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              {isPhotos
                ? "Les photos de profil ont été synchronisées"
                : "Les employés ont été synchronisés depuis Office 365"}
            </p>
          </div>

          {/* Résultats */}
          <div className="space-y-4">
            {/* Employés/Photos synchronisés */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isPhotos ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    )}
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    {isPhotos ? "Photos mises à jour" : "Employés synchronisés"}
                  </p>
                  <p className="text-2xl font-bold text-black dark:text-zinc-50">
                    {result.synced.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Erreurs */}
            {result.errors > 0 && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      Erreurs
                    </p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {result.errors.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Ignorés */}
            {result.skipped > 0 && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      {isPhotos ? "Non disponibles" : "Ignorés"}
                    </p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {result.skipped.toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 max-w-xs text-right">
                  {isPhotos ? "Employés sans photo ou erreur introuvable" : "Comptes invités ou système"}
                </p>
              </div>
            )}
          </div>

          {/* Bouton de fermeture */}
          <div className="flex justify-center pt-4">
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 hover:shadow-lg min-w-[120px]"
            >
              OK
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Chargement...</p>
        </div>
      )}
    </Modal>
  );
};

export default SyncResultModal;

