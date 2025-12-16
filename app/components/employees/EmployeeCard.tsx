'use client';
import React from 'react';
import MagicContainer from '../MagicContainer';
import { Employee } from '../../types/employee';

interface EmployeeCardProps {
  employee: Employee;
  onSelect?: (employee: Employee) => void;
  showActions?: boolean;
  onDeactivate?: (id: string) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onSelect,
  showActions = false,
  onDeactivate,
}) => {
  // Générer des initiales
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Générer une couleur de fond basée sur le nom
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
    <MagicContainer>
      <div
        className={`rounded-3xl bg-white dark:bg-zinc-900 p-6 transition-all duration-300 hover:shadow-xl ${
          onSelect ? 'cursor-pointer' : ''
        } ${!employee.isActive ? 'opacity-60' : ''}`}
        onClick={() => onSelect?.(employee)}
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className={`flex-shrink-0 w-16 h-16 rounded-2xl ${getAvatarColor(
              employee.displayName
            )} flex items-center justify-center text-white text-xl font-bold shadow-lg`}
          >
            {employee.profilePicture ? (
              <img
                src={employee.profilePicture}
                alt={employee.displayName}
                className="w-full h-full rounded-2xl object-cover"
              />
            ) : (
              getInitials(employee.displayName)
            )}
          </div>

          {/* Informations */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-black dark:text-zinc-50 mb-1 truncate">
                  {employee.displayName}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate mb-2">
                  {employee.email}
                </p>
              </div>
              {!employee.isActive && (
                <span className="flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                  Inactif
                </span>
              )}
            </div>

            {/* Détails */}
            <div className="space-y-1 mt-3">
              {employee.jobTitle && (
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
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
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {employee.jobTitle}
                </div>
              )}
              {employee.department && (
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  {employee.department}
                </div>
              )}
              {employee.officeLocation && (
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {employee.officeLocation}
                </div>
              )}
            </div>

            {/* Actions */}
            {showActions && employee.isActive && onDeactivate && (
              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeactivate(employee._id);
                  }}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                >
                  Désactiver
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MagicContainer>
  );
};

export default EmployeeCard;

