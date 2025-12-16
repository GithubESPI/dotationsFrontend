'use client';
import React from 'react';
import { useEmployeeSearchStore } from '../../stores/employeeSearchStore';
import { useEmployeeStats } from '../../hooks/useEmployees';

const EmployeeFilters: React.FC = () => {
  const { searchParams, setDepartment, setOfficeLocation, setIsActive, resetFilters } =
    useEmployeeSearchStore();
  const { data: stats } = useEmployeeStats();

  const hasActiveFilters =
    searchParams.department ||
    searchParams.officeLocation ||
    searchParams.isActive !== undefined;

  // Extraire les départements uniques depuis les stats
  const departments = stats?.byDepartment
    .filter((d) => d._id)
    .map((d) => d._id as string)
    .sort() || [];

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      {/* Filtre par département */}
      <div className="flex-1 min-w-[200px]">
        <select
          value={searchParams.department || ''}
          onChange={(e) => setDepartment(e.target.value || undefined)}
          className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les départements</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Filtre par statut */}
      <div>
        <select
          value={searchParams.isActive === undefined ? '' : searchParams.isActive.toString()}
          onChange={(e) =>
            setIsActive(
              e.target.value === '' ? undefined : e.target.value === 'true'
            )
          }
          className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les statuts</option>
          <option value="true">Actifs uniquement</option>
          <option value="false">Inactifs uniquement</option>
        </select>
      </div>

      {/* Bouton réinitialiser */}
      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm font-medium"
        >
          Réinitialiser
        </button>
      )}
    </div>
  );
};

export default EmployeeFilters;

