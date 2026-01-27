'use client';

import React from 'react';
import { useEquipmentSearchStore } from '../../stores/equipmentSearchStore';
import { useEquipmentStats, useEquipmentAll } from '../../hooks/useEquipment';

const EquipmentFilters: React.FC = () => {
    const { searchParams, setStatus, setType, setLocation, setSearchQuery, reset } = useEquipmentSearchStore();
    const { data: stats } = useEquipmentStats();
    const { data: allEquipment } = useEquipmentAll();

    // Mapping des types pour affichage
    const typeLabels: Record<string, string> = {
        'PC_PORTABLE': '💻 PC Portable',
        'PC_FIXE': '🖥️ PC Fixe',
        'TABLETTE': '📱 Tablette',
        'MOBILE': '📱 Mobile',
        'ECRAN': '🖥️ Écran',
        'TELEPHONE_IP': '📞 Téléphone IP',
        'AUTRES': '🔌 Autres',
    };

    // Extraire les localisations, statuts et types uniques
    const { locations, statuses, types } = React.useMemo(() => {
        if (!allEquipment) return { locations: [], statuses: [], types: [] };

        const uniqueLocations = new Set<string>();
        const uniqueStatuses = new Set<string>();
        const uniqueTypes = new Set<string>();

        allEquipment.forEach(item => {
            // Localisation
            const jiraLoc = item.jiraAttributes?.['Localisation'];
            if (jiraLoc && typeof jiraLoc === 'string' && jiraLoc.trim() !== '') {
                uniqueLocations.add(jiraLoc.trim());
            } else if (item.location && item.location.trim() !== '') {
                uniqueLocations.add(item.location.trim());
            }

            // Statut
            const jiraStatus = item.jiraAttributes?.['Status'];
            if (jiraStatus && typeof jiraStatus === 'string' && jiraStatus.trim() !== '') {
                uniqueStatuses.add(jiraStatus.trim());
            } else if (item.status) {
                uniqueStatuses.add(item.status);
            }

            // Type
            if (item.type) {
                uniqueTypes.add(item.type);
            }
        });

        return {
            locations: Array.from(uniqueLocations).sort(),
            statuses: Array.from(uniqueStatuses).sort(),
            types: Array.from(uniqueTypes).sort()
        };
    }, [allEquipment]);

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setType(e.target.value);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatus(e.target.value);
    };

    const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLocation(e.target.value);
    };

    const hasActiveFilters =
        searchParams.query ||
        searchParams.status ||
        searchParams.location;

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

                {/* Search Bar - Name/Brand/Model/User */}
                <div className="md:col-span-4 relative">
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 ml-1">
                        RECHERCHE RAPIDE
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={searchParams.query || ''}
                            onChange={handleSearchChange}
                            placeholder="Nom, marque, modèle..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                        />
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Type Filter */}
                <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 ml-1">
                        TYPE
                    </label>
                    <div className="relative">
                        <select
                            value={searchParams.type || ''}
                            onChange={handleTypeChange}
                            className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-50 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium cursor-pointer"
                        >
                            <option value="">Tous</option>
                            {types.map((type) => (
                                <option key={type} value={type}>
                                    {typeLabels[type] || type}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Status Filter */}
                <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 ml-1">
                        STATUT
                    </label>
                    <div className="relative">
                        <select
                            value={searchParams.status || ''}
                            onChange={handleStatusChange}
                            className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-50 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium cursor-pointer"
                        >
                            <option value="">Tous les statuts</option>
                            {statuses.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Location Filter */}
                <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 ml-1">
                        LOCALISATION
                    </label>
                    <div className="relative">
                        <select
                            value={searchParams.location || ''}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-50 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium cursor-pointer"
                        >
                            <option value="">Toutes</option>
                            {locations.map((loc) => (
                                <option key={loc} value={loc}>
                                    📍 {loc}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Reset Button */}
                <div className="md:col-span-1 flex justify-end">
                    {hasActiveFilters && (
                        <button
                            onClick={() => reset()}
                            className="w-full h-[42px] flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                            title="Réinitialiser les filtres"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

            </div>

            {/* Active Filters Summary (Optional visual enhancement) */}
            <div className="flex gap-2 mt-3 flex-wrap">
                {searchParams.type && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">
                        Type: {typeLabels[searchParams.type] || searchParams.type}
                    </span>
                )}
                {searchParams.status && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                        Statut: {searchParams.status}
                    </span>
                )}
                {searchParams.location && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                        Lieu: {searchParams.location}
                    </span>
                )}
            </div>

        </div>
    );
};

export default EquipmentFilters;
