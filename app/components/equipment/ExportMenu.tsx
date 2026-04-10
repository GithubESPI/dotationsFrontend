'use client';

import React, { useState, useRef, useEffect } from 'react';
import { exportEquipmentsToExcel, exportEquipmentsToPDF } from '../../utils/exportUtils';
import { useEquipmentAll } from '../../hooks/useEquipment';
import { useEquipmentSearchStore } from '../../stores/equipmentSearchStore';
import { Equipment } from '../../types/equipment';

export default function ExportMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // On utilise les données totales (non paginées) pour ne pas être limité à la page actuelle
    const { data: allEquipment, isLoading } = useEquipmentAll();
    const searchParams = useEquipmentSearchStore((state) => state.searchParams);

    // Fermer le dropdown si on clique en dehors
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fonction de filtrage local (reproduit le comportement backend sur toutes les données pour la vue "Filtré")
    const getFilteredData = (): Equipment[] => {
        if (!allEquipment) return [];
        
        return allEquipment.filter(eq => {
            let match = true;

            // Filtre Query (Toutes ces valeurs doivent contenir la recherche)
            if (searchParams.query) {
                const q = searchParams.query.toLowerCase();
                const textTarget = `
                    ${eq.brand || ''} ${eq.model || ''} ${eq.serialNumber || ''} 
                    ${eq.jiraAttributes?.['Name'] || ''} ${eq.jiraAttributes?.['Utilisateur'] || ''}
                `.toLowerCase();
                if (!textTarget.includes(q)) match = false;
            }

            // Filtre Type
            if (searchParams.type) {
                const eqType = eq.objectTypeName || eq.type || '';
                if (eqType !== searchParams.type) match = false;
            }

            // Filtre Status
            if (searchParams.status) {
                const eqStatus = eq.jiraAttributes?.['Status'] || eq.status || '';
                if (eqStatus !== searchParams.status) match = false;
            }

            // Filtre Location
            if (searchParams.location) {
                const eqLoc = eq.jiraAttributes?.['Localisation'] || eq.location || '';
                if (eqLoc !== searchParams.location) match = false;
            }

            // Filtre Incomplet
            if (searchParams.onlyIncomplete) {
                if (!eq.isMissingSerialNumber) match = false;
            }

            return match;
        });
    };

    const handleExport = (format: 'pdf' | 'excel', scope: 'global' | 'filtered') => {
        setIsOpen(false); // fermer le menu

        if (!allEquipment) return;
        
        const isGlobal = scope === 'global';
        const dataToExport = isGlobal ? allEquipment : getFilteredData();
        const prefix = isGlobal ? 'Global' : 'Filtre';
        
        if (dataToExport.length === 0) {
            alert("Aucune donnée correspondante à exporter.");
            return;
        }

        const dateSuffix = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const filename = `Equipements_${prefix}_${dateSuffix}`;

        if (format === 'excel') {
            exportEquipmentsToExcel(dataToExport, `${filename}.xlsx`);
        } else {
            exportEquipmentsToPDF(dataToExport, `${filename}.pdf`);
        }
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                className="px-4 py-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 font-medium transition-all duration-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                title="Exporter la liste des équipements"
            >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">Exporter</span>
                <svg className={`w-4 h-4 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-zinc-800 shadow-xl ring-1 ring-black/5 dark:ring-white/10 z-50 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-700 transform opacity-100 scale-100 transition-all duration-200">
                    <div className="p-1">
                        <div className="px-3 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                            Vue filtrée ({getFilteredData().length})
                        </div>
                        <button
                            onClick={() => handleExport('excel', 'filtered')}
                            className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-md transition-colors flex items-center gap-3"
                        >
                            <span>📊</span> Excel
                        </button>
                        <button
                            onClick={() => handleExport('pdf', 'filtered')}
                            className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400 rounded-md transition-colors flex items-center gap-3"
                        >
                            <span>📄</span> PDF
                        </button>
                    </div>

                    <div className="p-1">
                        <div className="px-3 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                            Global ({allEquipment?.length || 0})
                        </div>
                        <button
                            onClick={() => handleExport('excel', 'global')}
                            className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-md transition-colors flex items-center gap-3"
                        >
                            <span>📊</span> Tout (Excel)
                        </button>
                        <button
                            onClick={() => handleExport('pdf', 'global')}
                            className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400 rounded-md transition-colors flex items-center gap-3"
                        >
                            <span>📄</span> Tout (PDF)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
