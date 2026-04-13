'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { useEmployeesSearch } from '../../hooks/useEmployees';
import { useAllocationFormStore } from '../../stores/allocationFormStore';
import { Employee } from '../../types/employee';
import { useAllocationsSearch } from '../../hooks/useAllocations';

interface EmployeeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmployeeSelectionModal: React.FC<EmployeeSelectionModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const openAllocationModal = useAllocationFormStore((state) => state.openModal);
  
  // Recherche d'employés
  const { data: employeesData, isLoading: isLoadingEmployees } = useEmployeesSearch({
    query: searchQuery,
    limit: 10,
    page: 1,
  });

  // Récupérer les allocations actives pour signaler les dotations en cours
  const { data: activeAllocationsData } = useAllocationsSearch({
    status: 'EN_COURS',
    limit: 100,
    page: 1,
  });

  // Créer un Set des IDs d'utilisateurs ayant une dotation en cours
  const activeUserIds = new Set(
    activeAllocationsData?.data?.map((alloc: any) => 
      typeof alloc.userId === 'string' ? alloc.userId : alloc.userId?._id
    ).filter(Boolean) || []
  );

  const handleSelectEmployee = (employee: Employee) => {
    openAllocationModal(employee);
    onClose();
  };

  const employees = employeesData?.data || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sélectionner un employé pour la dotation"
      size="lg"
    >
      <div className="space-y-6">
        {/* Barre de recherche */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg className="w-5 h-5 text-zinc-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, email ou département..."
            className="w-full h-14 pl-12 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            autoFocus
          />
        </div>

        {/* Liste des employés */}
        <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
          {isLoadingEmployees ? (
            <div className="py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-2 text-zinc-500 dark:text-zinc-400">Recherche des employés...</p>
            </div>
          ) : employees.length > 0 ? (
            employees.map((employee) => (
              <button
                key={employee._id}
                onClick={() => handleSelectEmployee(employee)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-blue-500/50 hover:bg-blue-50/10 dark:hover:bg-blue-900/10 transition-all group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 font-bold overflow-hidden">
                    {employee.profilePictureUrl ? (
                      <img src={employee.profilePictureUrl} alt={employee.displayName} className="h-full w-full object-cover" />
                    ) : (
                      employee.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {employee.displayName}
                    </h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{employee.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {employee.department && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {employee.department}
                        </span>
                      )}
                      {activeUserIds.has(employee._id) && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50 font-medium">
                          Dotation en cours
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-2 rounded-full border border-zinc-200 dark:border-zinc-700 group-hover:border-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </button>
            ))
          ) : (
            <div className="py-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <p className="text-zinc-500 dark:text-zinc-400">Aucun employé trouvé</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {searchQuery ? 'Résultats de recherche' : 'Employés récemment synchronisés'}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default EmployeeSelectionModal;
