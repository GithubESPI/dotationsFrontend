'use client';
import React from 'react';
import MagicContainer from './MagicContainer';
import { User } from '../services/auth.service';

interface UserCardProps {
  user: User;
  className?: string;
  showGraphData?: boolean;
  onAction?: () => void;
  actionLabel?: string;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  className = '',
  showGraphData = false,
  onAction,
  actionLabel,
}) => {
  // Générer des initiales à partir du nom
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Générer une couleur de fond basée sur le nom (pour la cohérence)
  const getAvatarColor = (name: string): string => {
    const colors = [
      'bg-gradient-to-br from-purple-500 to-pink-500',
      'bg-gradient-to-br from-blue-500 to-cyan-500',
      'bg-gradient-to-br from-green-500 to-emerald-500',
      'bg-gradient-to-br from-orange-500 to-red-500',
      'bg-gradient-to-br from-indigo-500 to-purple-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <MagicContainer className={className}>
      <div className="relative rounded-3xl bg-white dark:bg-zinc-900 p-6 md:p-8 transition-all duration-300 hover:shadow-xl">
        {/* En-tête avec avatar et nom */}
        <div className="flex items-start gap-4 mb-6">
          <div
            className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl ${getAvatarColor(
              user.name
            )} flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg transition-transform duration-300 hover:scale-110`}
          >
            {getInitials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl font-bold text-black dark:text-zinc-50 mb-1 truncate">
              {user.name}
            </h2>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 truncate">
              {user.email}
            </p>
          </div>
        </div>

        {/* Informations utilisateur */}
        <div className="space-y-4 mb-6">
          {/* ID */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a4.001 4.001 0 00-8 0c0 1.306.835 2.417 2 2.83M15 18h-3m3 0a2 2 0 002-2v-1a2 2 0 00-2-2h-3m3 4v1a2 2 0 01-2 2H9a2 2 0 01-2-2v-1"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">ID</p>
              <p className="text-sm font-medium text-black dark:text-zinc-50 truncate">
                {user.id}
              </p>
            </div>
          </div>

          {/* Rôles */}
          {user.roles && user.roles.length > 0 && (
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Rôles</p>
              <div className="flex flex-wrap gap-2">
                {user.roles.map((role, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Données Microsoft Graph (optionnel) */}
        {showGraphData && user.graphData && (
          <div className="mb-6 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-sm font-semibold text-black dark:text-zinc-50 mb-3 flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Données Microsoft Graph
            </h3>
            <pre className="overflow-auto text-xs text-zinc-700 dark:text-zinc-300 max-h-48 rounded p-3 bg-white dark:bg-zinc-900">
              {JSON.stringify(user.graphData, null, 2)}
            </pre>
          </div>
        )}

        {/* Bouton d'action (optionnel) */}
        {onAction && actionLabel && (
          <button
            onClick={onAction}
            className="w-full mt-4 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </MagicContainer>
  );
};

export default UserCard;

