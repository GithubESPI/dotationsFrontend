'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useEquipmentAll } from '../../hooks/useEquipment';
import { useAllocationsAll } from '../../hooks/useAllocations';
import { Equipment } from '../../types/equipment';
import { useDebounce } from 'use-debounce';

interface LocalEquipmentSearchProps {
    onSelect: (equipment: Equipment) => void;
    placeholder?: string;
    className?: string;
    excludeIds?: string[];
}

const LocalEquipmentSearch: React.FC<LocalEquipmentSearchProps> = ({
    onSelect,
    placeholder = 'Tapez pour rechercher (Nom de l\'équipement, N/S, Marque, Localisation...)',
    className = '',
    excludeIds = [],
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery] = useDebounce(searchQuery, 300);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Charger tous les équipements pour voir ceux qui sont déjà affectés
    const { data: allEquipment, isLoading: isLoadingEquipment } = useEquipmentAll();
    // Charger toutes les allocations pour vérifier le statut réel
    const { data: allAllocations, isLoading: isLoadingAllocations } = useAllocationsAll();

    const isLoading = isLoadingEquipment || isLoadingAllocations;

    // Calculer les IDs des équipements indisponibles (dans une allocation en cours ou en retard)
    const unavailableEquipmentIds = useMemo(() => {
        if (!allAllocations) return new Set<string>();

        const ids = new Set<string>();
        allAllocations.forEach(allocation => {
            if (allocation.status === 'EN_COURS' || allocation.status === 'EN_RETARD') {
                allocation.equipments.forEach(eq => {
                    if (typeof eq.equipmentId === 'string') {
                        ids.add(eq.equipmentId);
                    } else if (eq.equipmentId && typeof eq.equipmentId === 'object' && eq.equipmentId._id) {
                        ids.add(eq.equipmentId._id);
                    }
                });
            }
        });
        return ids;
    }, [allAllocations]);

    // Filtrer les équipements
    const filteredEquipment = useMemo(() => {
        let filtered = allEquipment || [];

        // Exclure les IDs spécifiés
        if (excludeIds.length > 0) {
            filtered = filtered.filter(eq => !excludeIds.includes(eq._id));
        }

        if (debouncedQuery.trim()) {
            const query = debouncedQuery.toLowerCase().trim();

            filtered = filtered.filter((eq) => {
                // Recherche dans les champs standards
                if (eq.serialNumber?.toLowerCase().includes(query)) return true;
                if (eq.brand?.toLowerCase().includes(query)) return true;
                if (eq.model?.toLowerCase().includes(query)) return true;
                if (eq.internalId?.toLowerCase().includes(query)) return true;
                if (eq.type?.toLowerCase().includes(query)) return true;

                // Recherche dans les attributs Jira
                if (eq.jiraAttributes) {
                    return Object.values(eq.jiraAttributes).some((value) => {
                        if (value === null || value === undefined) return false;

                        // Si c'est une string
                        if (typeof value === 'string') {
                            return value.toLowerCase().includes(query);
                        }

                        // Si c'est un nombre
                        if (typeof value === 'number') {
                            return value.toString().includes(query);
                        }

                        // Si c'est un objet (cas complexe, ex: status, value, etc.)
                        // On essaie de stringify ou chercher dans des propriétés communes
                        if (typeof value === 'object') {
                            try {
                                const str = JSON.stringify(value).toLowerCase();
                                return str.includes(query);
                            } catch (e) {
                                return false;
                            }
                        }

                        return false;
                    });
                }

                return false;
            });
        }

        // Limiter les résultats
        return filtered.slice(0, 50);
    }, [allEquipment, debouncedQuery, excludeIds]);

    // Gérer les touches du clavier
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev < filteredEquipment.length - 1 ? prev + 1 : prev));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
            } else if (e.key === 'Enter' && selectedIndex >= 0 && filteredEquipment[selectedIndex]) {
                e.preventDefault();
                const selected = filteredEquipment[selectedIndex];
                const isUnavailable = unavailableEquipmentIds.has(selected._id);
                if (!isUnavailable) {
                    handleSelect(selected);
                }
            } else if (e.key === 'Escape') {
                setIsOpen(false);
                setSearchQuery('');
                setSelectedIndex(-1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredEquipment, selectedIndex]);

    // Scroll vers l'élément sélectionné
    useEffect(() => {
        if (selectedIndex >= 0 && dropdownRef.current) {
            const selectedElement = dropdownRef.current.children[selectedIndex] as HTMLElement;
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [selectedIndex]);

    const handleSelect = (equipment: Equipment) => {
        onSelect(equipment);
        setIsOpen(false);
        setSearchQuery('');
        setSelectedIndex(-1);
        if (inputRef.current) {
            inputRef.current.blur();
        }
    };

    const getDisplayName = (eq: Equipment) => {
        const parts = [];

        // Essayer de récupérer le "Nom" ou "Name" des attributs Jira qui est souvent plus parlant
        const jiraName = eq.jiraAttributes?.['Name'] || eq.jiraAttributes?.['Nom'];
        if (jiraName) parts.push(jiraName);

        if (eq.brand) parts.push(eq.brand);
        if (eq.model) parts.push(eq.model);

        if (parts.length === 0) return `Équipement ${eq.serialNumber}`;
        return parts.join(' - ');
    };

    const getSubtitle = (eq: Equipment) => {
        const parts = [];
        if (eq.internalId) parts.push(eq.internalId);
        parts.push(`SN: ${eq.serialNumber}`);
        parts.push(eq.type);

        // Ajouter quelques attributs clés de Jira si présents pour aider à l'identification
        if (eq.jiraAttributes) {
            const interestingKeys = ['Date d\'achat', 'Warranty expiration', 'Status', 'User'];
            interestingKeys.forEach(key => {
                if (eq.jiraAttributes?.[key]) {
                    parts.push(`${key}: ${eq.jiraAttributes[key]}`);
                }
            });
        }

        // Ajouter la localisation si disponible
        if (eq.location) {
            parts.push(`📍 ${eq.location}`);
        } else if (eq.jiraAttributes?.['Localisation']) {
            parts.push(`📍 ${eq.jiraAttributes['Localisation']}`);
        }

        return parts.join(' | ');
    };

    return (
        <div className={`relative ${className}`}>
            {/* Input de recherche */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <svg
                        className="w-5 h-5 text-zinc-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsOpen(true);
                        setSelectedIndex(-1);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => {
                            setSearchQuery('');
                            setIsOpen(false);
                        }}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                )}
            </div>

            {/* Dropdown avec résultats */}
            {isOpen && (
                <>
                    {/* Backdrop pour fermer au clic extérieur */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => {
                            setIsOpen(false);
                            setSelectedIndex(-1);
                        }}
                    />

                    {/* Dropdown */}
                    <div
                        ref={dropdownRef}
                        className="absolute z-20 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl max-h-96 overflow-y-auto"
                    >
                        {isLoading ? (
                            <div className="p-4 text-center">
                                <div className="inline-block w-6 h-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                                    Chargement des équipements...
                                </p>
                            </div>
                        ) : filteredEquipment.length === 0 ? (
                            <div className="p-4 text-center text-zinc-600 dark:text-zinc-400">
                                {debouncedQuery ? (
                                    <>
                                        <p className="font-medium">Aucun équipement trouvé</p>
                                        <p className="text-sm mt-1">Essayez d'autres termes de recherche</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-medium">Commencez à taper pour rechercher</p>
                                        <p className="text-sm mt-1">Recherchez par nom, numéro de série, marque ou attributs Jira</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="p-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700">
                                    {filteredEquipment.length} équipement{filteredEquipment.length > 1 ? 's' : ''} trouvé{filteredEquipment.length > 1 ? 's' : ''}
                                </div>
                                {filteredEquipment.map((eq, index) => (
                                    <button
                                        key={eq._id}
                                        type="button"
                                        disabled={unavailableEquipmentIds.has(eq._id)}
                                        onClick={() => handleSelect(eq)}
                                        className={`w-full text-left p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-100 dark:border-zinc-800 last:border-0 
                                            ${index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''}
                                            ${unavailableEquipmentIds.has(eq._id) ? 'opacity-60 bg-zinc-50 dark:bg-zinc-900/50 cursor-not-allowed' : ''}
                                        `}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-black dark:text-zinc-50 truncate">
                                                        {getDisplayName(eq)}
                                                    </p>
                                                    {unavailableEquipmentIds.has(eq._id) && (
                                                        <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider text-amber-600 bg-amber-100 rounded border border-amber-200">
                                                            Déjà affecté
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">
                                                    {getSubtitle(eq)}
                                                </p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {eq.brand && (
                                                        <span className="px-2 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                                            {eq.brand}
                                                        </span>
                                                    )}
                                                    {eq.model && (
                                                        <span className="px-2 py-1 text-xs rounded bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                                                            {eq.model}
                                                        </span>
                                                    )}
                                                    <span className="px-2 py-1 text-xs rounded bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-mono">
                                                        {eq.serialNumber}
                                                    </span>
                                                </div>
                                            </div>
                                            {!unavailableEquipmentIds.has(eq._id) && (
                                                <svg
                                                    className="w-5 h-5 text-zinc-400 flex-shrink-0"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 5l7 7-7 7"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default LocalEquipmentSearch;
