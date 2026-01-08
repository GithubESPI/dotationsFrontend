'use client';

import { useState } from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useEmployeeSearchStore } from '../stores/employeeSearchStore';
import { useEmployeesSearch, useSyncEmployees, useSyncEmployeePhotos, useDeactivateEmployee } from '../hooks/useEmployees';
import SearchBar from '../components/employees/SearchBar';
import EmployeeFilters from '../components/employees/EmployeeFilters';
import EmployeeCard from '../components/employees/EmployeeCard';
import EmployeeStats from '../components/employees/EmployeeStats';
import SyncResultModal from '../components/employees/SyncResultModal';
import EmployeeDetailsModal from '../components/employees/EmployeeDetailsModal';
import AllocationFormModal from '../components/allocations/AllocationFormModal';
import { useAllocationFormStore } from '../stores/allocationFormStore';
import { useRouter } from 'next/navigation';
import { Employee } from '../types/employee';

export default function EmployeesPage() {
  const router = useRouter();
  const { searchParams, setPage } = useEmployeeSearchStore();
  const { data, isLoading, error, refetch } = useEmployeesSearch(searchParams);
  const syncMutation = useSyncEmployees();
  const deactivateMutation = useDeactivateEmployee();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [syncError, setSyncError] = useState<Error | null>(null);

  // États pour la synchronisation des photos
  const syncPhotosMutation = useSyncEmployeePhotos();
  const [showPhotoSyncModal, setShowPhotoSyncModal] = useState(false);
  const [photoSyncResult, setPhotoSyncResult] = useState<any>(null);
  const [photoSyncError, setPhotoSyncError] = useState<Error | null>(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState<Employee | null>(null);

  const handleSync = async () => {
    try {
      setSyncError(null);
      setSyncResult(null);
      setShowSyncModal(true);
      const result = await syncMutation.mutateAsync(undefined);
      setSyncResult(result);
    } catch (error: any) {
      setSyncError(error);
      setSyncResult(null);
    }
  };

  const handleCloseSyncModal = () => {
    setShowSyncModal(false);
    setSyncResult(null);
    setSyncError(null);
  };

  const handlePhotoSync = async () => {
    try {
      setPhotoSyncError(null);
      setPhotoSyncResult(null);
      setShowPhotoSyncModal(true);
      const result = await syncPhotosMutation.mutateAsync({});
      // Mapper le résultat 'updated' vers 'synced' pour le modal
      setPhotoSyncResult({
        synced: result.updated,
        errors: result.errors,
        skipped: result.skipped
      });
    } catch (error: any) {
      setPhotoSyncError(error);
      setPhotoSyncResult(null);
    }
  };

  const handleClosePhotoSyncModal = () => {
    setShowPhotoSyncModal(false);
    setPhotoSyncResult(null);
    setPhotoSyncError(null);
  };

  const handleDeactivate = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir désactiver cet employé ?')) {
      try {
        await deactivateMutation.mutateAsync(id);
        refetch();
      } catch (error: any) {
        alert(`Erreur lors de la désactivation: ${error.message}`);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (employee: Employee) => {
    setSelectedEmployeeDetails(employee);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedEmployeeDetails(null);
  };

  const { openModal: openAllocationModal } = useAllocationFormStore();

  const handleAllocateEquipment = (employee: Employee) => {
    openAllocationModal(employee);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-900 dark:to-black">
        <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-zinc-50 mb-2">
                Gestion des Employés
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Recherchez et gérez les employés synchronisés depuis Office 365
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handlePhotoSync}
                disabled={syncPhotosMutation.isPending || syncMutation.isPending}
                className="px-6 py-3 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-all duration-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                title="Synchroniser les photos de profil (optionnel)"
              >
                <svg className={`w-5 h-5 ${syncPhotosMutation.isPending ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {syncPhotosMutation.isPending ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  )}
                </svg>
                {syncPhotosMutation.isPending ? 'Photos...' : 'Photos'}
              </button>
              <button
                onClick={handleSync}
                disabled={syncMutation.isPending || syncPhotosMutation.isPending}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncMutation.isPending ? 'Synchronisation...' : 'Synchroniser depuis Office 365'}
              </button>
            </div>
          </div>

          {/* Statistiques */}
          <EmployeeStats />

          {/* Barre de recherche */}
          <div className="mb-6">
            <SearchBar autoFocus />
          </div>

          {/* Filtres */}
          <div className="mb-6">
            <EmployeeFilters />
          </div>

          {/* Résultats */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
                <div className="text-lg text-zinc-600 dark:text-zinc-400">
                  Chargement des employés...
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mb-4 text-4xl">⚠️</div>
                <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                  Erreur de chargement
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  {error instanceof Error ? error.message : 'Une erreur est survenue'}
                </p>
                <button
                  onClick={() => refetch()}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Réessayer
                </button>
              </div>
            </div>
          ) : data && data.data.length > 0 ? (
            <>
              {/* Statistiques de recherche */}
              <div className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
                {data.pagination.total} employé{data.pagination.total > 1 ? 's' : ''} trouvé
                {data.pagination.total > 1 ? 's' : ''}
                {searchParams.query && ` pour "${searchParams.query}"`}
              </div>

              {/* Grille d'employés */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {data.data.map((employee) => (
                  <EmployeeCard
                    key={employee._id}
                    employee={employee}
                    onSelect={setSelectedEmployee}
                    showActions
                    onDeactivate={handleDeactivate}
                    onViewDetails={handleViewDetails}
                    onAllocateEquipment={handleAllocateEquipment}
                  />
                ))}
              </div>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => handlePageChange(searchParams.page - 1)}
                    disabled={searchParams.page === 1}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Précédent
                  </button>
                  <div className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium">
                    Page {searchParams.page} sur {data.pagination.totalPages}
                  </div>
                  <button
                    onClick={() => handlePageChange(searchParams.page + 1)}
                    disabled={searchParams.page >= data.pagination.totalPages}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mb-4 text-4xl">🔍</div>
                <h2 className="text-xl font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                  Aucun employé trouvé
                </h2>
                <p className="text-zinc-500 dark:text-zinc-500">
                  {searchParams.query
                    ? 'Essayez de modifier vos critères de recherche'
                    : 'Synchronisez les employés depuis Office 365 pour commencer'}
                </p>
              </div>
            </div>
          )}

          {/* Modal de résultat de synchronisation */}
          <SyncResultModal
            isOpen={showSyncModal}
            onClose={handleCloseSyncModal}
            result={syncResult}
            error={syncError}
            isLoading={syncMutation.isPending}
            mode="employees"
          />

          {/* Modal de résultat de synchronisation des photos */}
          <SyncResultModal
            isOpen={showPhotoSyncModal}
            onClose={handleClosePhotoSyncModal}
            result={photoSyncResult}
            error={photoSyncError}
            isLoading={syncPhotosMutation.isPending}
            mode="photos"
          />

          {/* Modal de détails de l'employé */}
          <EmployeeDetailsModal
            isOpen={showDetailsModal}
            onClose={handleCloseDetailsModal}
            employee={selectedEmployeeDetails}
          />

          {/* Modal de formulaire d'allocation */}
          <AllocationFormModal />
        </div>
      </div>
    </ProtectedRoute >
  );
}

