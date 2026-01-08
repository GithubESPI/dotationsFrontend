'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { useUser, useUserGroups } from '../hooks/useUser';
import UserCard from '../components/UserCard';
import StatCard from '../components/dashboard/StatCard';
import QuickActions from '../components/dashboard/QuickActions';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import { useQueryClient } from '@tanstack/react-query';
import { useSyncLaptops } from '../hooks/useJiraAsset';
import SyncResultModal from '../components/equipment/SyncResultModal';
import { SyncResponse } from '../types/jira-asset';

export default function DashboardPage() {
  const router = useRouter();
  const { user: authUser, logout, isLoading: authLoading } = useAuth();
  const { data: user, isLoading: userLoading, error: userError } = useUser();
  const { data: groups, error: groupsError } = useUserGroups();
  const queryClient = useQueryClient();

  // États pour la synchronisation Jira
  const syncMutation = useSyncLaptops();
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResponse | null>(null);
  const [syncError, setSyncError] = useState<Error | null>(null);

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    router.push('/login');
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['user'] });
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

  const isLoading = authLoading || userLoading;

  // Données de démonstration pour les statistiques
  const stats = [
    {
      title: 'Total Dotations',
      value: '24',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      trend: { value: 12, label: 'vs mois dernier', isPositive: true },
    },
    {
      title: 'En Attente',
      value: '8',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      trend: { value: 5, label: 'nouveaux', isPositive: false },
    },
    {
      title: 'Approuvées',
      value: '16',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      trend: { value: 23, label: 'vs mois dernier', isPositive: true },
    },
    {
      title: 'Groupes',
      value: groups?.length || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ];

  const quickActions = [
    {
      label: 'Nouvelle Dotation',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      onClick: () => {
        // TODO: Implémenter la navigation vers la création de dotation
        console.log('Nouvelle dotation');
      },
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Employés',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      onClick: () => {
        router.push('/employees');
      },
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Tous les Équipements',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      onClick: () => {
        router.push('/equipment');
      },
      color: 'from-indigo-500 to-violet-500',
    },
    {
      label: 'Paramètres',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      onClick: () => {
        // TODO: Implémenter la navigation vers les paramètres
        console.log('Paramètres');
      },
      color: 'from-orange-500 to-red-500',
    },
  ];

  // Activités récentes (données de démonstration)
  const recentActivities = [
    {
      id: '1',
      title: 'Dotation approuvée',
      description: 'Votre demande de dotation #1234 a été approuvée',
      time: 'Il y a 2 heures',
      type: 'success' as const,
    },
    {
      id: '2',
      title: 'Nouvelle demande',
      description: 'Une nouvelle demande de dotation a été soumise',
      time: 'Il y a 5 heures',
      type: 'info' as const,
    },
    {
      id: '3',
      title: 'Document requis',
      description: 'Un document supplémentaire est requis pour la demande #1235',
      time: 'Il y a 1 jour',
      type: 'warning' as const,
    },
  ];

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
            <div className="text-lg text-zinc-600 dark:text-zinc-400">Chargement du tableau de bord...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (userError) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
          <div className="text-center">
            <div className="mb-4 text-4xl">⚠️</div>
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              Erreur de chargement
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Impossible de charger les données du tableau de bord
            </p>
            <button
              onClick={handleRefresh}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-900 dark:to-black">
        <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-zinc-50 mb-2">
                Tableau de bord
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Bienvenue, {user?.name || authUser?.name || 'Utilisateur'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSync}
                disabled={syncMutation.isPending}
                className="rounded-lg bg-blue-600 bg-opacity-10 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/50 flex items-center justify-center gap-2"
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
                onClick={handleRefresh}
                className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-black dark:text-zinc-50 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                Actualiser
              </button>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Déconnexion
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                trend={stat.trend}
              />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* User Card */}
            <div className="lg:col-span-1">
              {user && <UserCard user={user} />}
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-4">
                  Actions rapides
                </h2>
                <QuickActions actions={quickActions} />
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="mb-8">
            <ActivityFeed activities={recentActivities} />
          </div>

          {/* Modal de résultat de synchronisation */}
          <SyncResultModal
            isOpen={showSyncModal}
            onClose={handleCloseSyncModal}
            result={syncResult}
            error={syncError}
            isLoading={syncMutation.isPending}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}

