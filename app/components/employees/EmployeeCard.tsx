'use client';
import React from 'react';
import { Employee } from '../../types/employee';

interface EmployeeCardProps {
  employee: Employee;
  onSelect?: (employee: Employee) => void;
  showActions?: boolean;
  onDeactivate?: (id: string) => void;
  onViewDetails?: (employee: Employee) => void;
  onAllocateEquipment?: (employee: Employee) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onSelect,
  showActions = false,
  onDeactivate,
  onViewDetails,
  onAllocateEquipment,
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

  // Générer une couleur de fond basée sur le nom (pour la couverture et l'avatar)
  const getGradientColor = (name: string): string => {
    const gradients = [
      'from-purple-500 via-pink-500 to-rose-500',
      'from-blue-500 via-cyan-500 to-teal-500',
      'from-green-500 via-emerald-500 to-lime-500',
      'from-orange-500 via-red-500 to-pink-500',
      'from-indigo-500 via-purple-500 to-pink-500',
      'from-cyan-500 via-blue-500 to-indigo-500',
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

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

  // Extraire le username depuis l'email
  const getUsername = (email: string): string => {
    return email.split('@')[0];
  };

  return (
    <div
      className={`w-full rounded-[23px] bg-white dark:bg-zinc-900 shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700 ${
        onSelect ? 'cursor-pointer' : ''
      } ${!employee.isActive ? 'opacity-60' : ''}`}
      onClick={() => onSelect?.(employee)}
    >
        {/* Image de couverture avec dégradé */}
        <div className={`relative h-32 bg-gradient-to-br ${getGradientColor(employee.displayName)}`}>
          {/* Badge de statut en haut à droite */}
          {!employee.isActive && (
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-red-500/90 backdrop-blur-sm text-white text-xs font-medium shadow-lg">
              Inactif
            </div>
          )}
          {employee.isActive && (
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-green-500/90 backdrop-blur-sm text-white text-xs font-medium shadow-lg flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              Actif
            </div>
          )}
        </div>

        {/* Contenu du profil */}
        <div className="relative p-6 pt-0">
          {/* Photo de profil positionnée en haut */}
          <div className="absolute left-6 -top-12">
            <div className="relative">
              <div
                className={`w-24 h-24 rounded-full border-4 border-white dark:border-zinc-900 shadow-xl overflow-hidden ${
                  employee.profilePicture || employee.profilePictureUrl
                    ? ''
                    : getAvatarColor(employee.displayName)
                }`}
              >
                {(employee.profilePicture || employee.profilePictureUrl) ? (
                  <img
                    src={employee.profilePicture || employee.profilePictureUrl}
                    alt={employee.displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback vers les initiales si l'image échoue
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const fallbackDiv = document.createElement('div');
                        fallbackDiv.className = 'w-full h-full flex items-center justify-center text-white text-2xl font-bold';
                        fallbackDiv.textContent = getInitials(employee.displayName);
                        parent.appendChild(fallbackDiv);
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                    {getInitials(employee.displayName)}
                  </div>
                )}
              </div>
              {/* Badge de statut sur la photo */}
              {employee.isActive && (
                <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-green-500 border-4 border-white dark:border-zinc-900 shadow-lg"></div>
              )}
            </div>
          </div>

          {/* Informations utilisateur */}
          <div className="text-left pt-14">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-black dark:text-zinc-50 mb-1 truncate">
                  {employee.displayName}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                  @{getUsername(employee.email)}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                  {employee.email}
                </p>
              </div>
            </div>

            {/* Poste et département */}
            {(employee.jobTitle || employee.department) && (
              <div className="mt-4 space-y-2">
                {employee.jobTitle && (
                  <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <div className="flex-shrink-0 w-5 h-5 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-blue-600 dark:text-blue-400"
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
                    </div>
                    <span className="font-medium">{employee.jobTitle}</span>
                  </div>
                )}
                {employee.department && (
                  <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <div className="flex-shrink-0 w-5 h-5 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-purple-600 dark:text-purple-400"
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
                    </div>
                    <span>{employee.department}</span>
                  </div>
                )}
                {employee.officeLocation && (
                  <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <div className="flex-shrink-0 w-5 h-5 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-green-600 dark:text-green-400"
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
                    </div>
                    <span>{employee.officeLocation}</span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700 space-y-2">
              {onAllocateEquipment && employee.isActive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAllocateEquipment(employee);
                  }}
                  className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium transition-all duration-200 hover:shadow-lg text-sm flex items-center justify-center gap-2"
                >
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Affecter du matériel
                </button>
              )}
              {onViewDetails && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(employee);
                  }}
                  className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 hover:shadow-lg text-sm"
                >
                  Voir les détails
                </button>
              )}
              {showActions && employee.isActive && onDeactivate && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeactivate(employee._id);
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
                >
                  Désactiver l'employé
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default EmployeeCard;

