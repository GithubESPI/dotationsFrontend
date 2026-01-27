'use client';

import { useState } from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useEquipmentSearch } from '../hooks/useEquipment';
import { useEquipmentSearchStore } from '../stores/equipmentSearchStore';
import EquipmentFormModal from '../components/equipment/EquipmentFormModal';
import EquipmentFilters from '../components/equipment/EquipmentFilters';

import { Equipment } from '../types/equipment';
import { useSyncLaptops } from '../hooks/useJiraAsset';
import SyncResultModal from '../components/equipment/SyncResultModal';
import { SyncResponse } from '../types/jira-asset';

export default function EquipmentPage() {
  const { searchParams, setPage } = useEquipmentSearchStore();
  const { data, isLoading, error, refetch } = useEquipmentSearch(searchParams);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // États pour la synchronisation Jira
  const syncMutation = useSyncLaptops();
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResponse | null>(null);
  const [syncError, setSyncError] = useState<Error | null>(null);

  const handleCreateEquipment = () => {
    setSelectedEquipment(null);
    setShowFormModal(true);
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setShowFormModal(true);
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
    setSelectedEquipment(null);
  };

  const handleFormSuccess = () => {
    refetch();
    handleCloseFormModal();
  };

  const handleSync = async () => {
    try {
      setSyncError(null);
      setSyncResult(null);
      setShowSyncModal(true);
      // Synchroniser les laptops avec détection automatique des attributs
      const result = await syncMutation.mutateAsync({
        objectTypeName: 'Laptop',
        autoDetectAttributes: true,
        schemaName: 'Parc Informatique',
        limit: 1000
      });
      setSyncResult(result);
      refetch(); // Rafraîchir la liste après synchronisation
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getEquipmentDisplayName = (equipment: Equipment) => {
    const attrs = equipment.jiraAttributes || {};

    // Essayer de trouver des valeurs plus précises dans les attributs
    // Priorité aux attributs qui contiennent probablement le vrai modèle
    const attrModel = attrs['Modèle'] || attrs['Model'] || attrs['Product Name'] || attrs['Name'];
    const attrBrand = attrs['Marque'] || attrs['Brand'] || attrs['Manufacturer'] || attrs['Constructeur'];

    let brand = attrBrand || equipment.brand;
    let model = attrModel || equipment.model;

    // Nettoyage spécifique si nécessaire
    if (brand === 'Inconnu') brand = '';
    if (model === 'Inconnu') model = '';

    const fullName = `${brand} ${model}`.trim();
    return fullName || 'Équipement Inconnu';
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-900 dark:to-black">
        <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* ... Header Content ... */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-zinc-50 mb-2">
                Gestion des Équipements
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Gérez les équipements et synchronisez depuis Jira Asset
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSync}
                disabled={syncMutation.isPending}
                className="px-6 py-3 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-all duration-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className={`w-5 h-5 ${syncMutation.isPending ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {syncMutation.isPending ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  )}
                </svg>
                {syncMutation.isPending ? 'Synchronisation...' : 'Synchroniser Jira'}
              </button>
              <a
                href="http://localhost:3001/dashboard"
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg flex items-center gap-2"
              >
                🏠 Home
              </a>
            </div>
          </div>

          {/* Filters */}
          <EquipmentFilters />

          {/* Résultats */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
                <div className="text-lg text-zinc-600 dark:text-zinc-400">
                  Chargement des équipements...
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
              <div className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
                {data.pagination.total} équipement{data.pagination.total > 1 ? 's' : ''} trouvé
                {data.pagination.total > 1 ? 's' : ''}
              </div>

              {/* Liste des équipements */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {data.data.map((equipment) => (
                  <div
                    key={equipment._id}
                    className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => handleEditEquipment(equipment)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
                          {getEquipmentDisplayName(equipment)}
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-mono">
                          {equipment.serialNumber}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${(() => {
                          // Récupérer le statut réel (Jira ou fallback)
                          const rawStatus = equipment.jiraAttributes?.['Status'] || equipment.status || '';
                          const status = String(rawStatus).toUpperCase();

                          if (status === 'DISPONIBLE' || status === 'EN STOCK') return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
                          if (status.includes('AFFECT') || status === 'ASSIGNED') return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
                          if (status.includes('REPARATION') || status.includes('BROKEN')) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
                          if (status.includes('LOST') || status === 'PERDU') return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
                          return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300';
                        })()}`}
                      >
                        {equipment.jiraAttributes?.['Status'] || equipment.status?.toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <span className="font-medium">Type:</span>
                        <span>{equipment.type}</span>
                      </div>

                      {/* Affichage de l'utilisateur si assigné */}
                      {(equipment.status?.toUpperCase() === 'AFFECTE' || equipment.status?.toUpperCase() === 'AFFECTÉ') && (
                        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                          <span className="font-medium">Utilisateur:</span>
                          <span>
                            {equipment.jiraAttributes?.['Utilisateur'] ||
                              equipment.jiraAttributes?.['User'] ||
                              equipment.jiraAttributes?.['user'] ||
                              equipment.currentUserId ||
                              'Non spécifié'}
                          </span>
                        </div>
                      )}

                      {/* Affichage de la localisation */}
                      {(equipment.location || equipment.jiraAttributes?.['Localisation']) && (
                        <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                          <span className="font-medium">Lieu:</span>
                          <span>
                            {equipment.jiraAttributes?.['Localisation'] || equipment.location}
                          </span>
                        </div>
                      )}

                      {equipment.internalId && (
                        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                          <span className="font-medium">ID interne:</span>
                          <span>{equipment.internalId}</span>
                        </div>
                      )}
                      {equipment.jiraAssetId && (
                        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-500">
                          <span>🔗 Jira: {equipment.jiraAssetId}</span>
                        </div>
                      )}
                    </div>
                  </div>
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
                <div className="mb-4 text-4xl">📦</div>
                <h2 className="text-xl font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                  Aucun équipement trouvé
                </h2>
                <p className="text-zinc-500 dark:text-zinc-500 mb-4">
                  Créez votre premier équipement ou synchronisez depuis Jira
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleSync}
                    disabled={syncMutation.isPending}
                    className="rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700 flex items-center justify-center gap-2"
                  >
                    <svg className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {syncMutation.isPending ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      )}
                    </svg>
                    {syncMutation.isPending ? 'Synchronisation...' : 'Synchroniser Jira'}
                  </button>
                  <button
                    onClick={handleCreateEquipment}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Créer un équipement
                  </button>
                </div>
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
          />

          {/* Modal de formulaire */}
          <EquipmentFormModal
            isOpen={showFormModal}
            onClose={handleCloseFormModal}
            equipmentId={selectedEquipment?._id}
            onSuccess={handleFormSuccess}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}

