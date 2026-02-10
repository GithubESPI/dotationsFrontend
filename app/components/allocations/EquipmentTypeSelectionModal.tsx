'use client';
import React, { useMemo } from 'react';
import Modal from '../ui/Modal';
import { useAvailableEquipment } from '../../hooks/useEquipment';
import { EquipmentType } from '../../types/equipment';

interface EquipmentTypeSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (type: EquipmentType) => void;
}

const equipmentTypes: { type: EquipmentType; label: string; icon: React.ReactNode; color: string }[] = [
    {
        type: 'PC_PORTABLE',
        label: 'PC Portable',
        color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
            </svg>
        ),
    },
    {
        type: 'PC_FIXE',
        label: 'PC Fixe',
        color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                {/* Replacement icon for Desktop PC as the previous one was Play button :D using a generic monitor/tower representation */}
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
        ),
    },
    {
        type: 'TABLETTE',
        label: 'Tablette',
        color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25v-15a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z" />
            </svg>
        ),
    },
    {
        type: 'MOBILE',
        label: 'Mobile',
        color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
        ),
    },
    {
        type: 'ECRAN',
        label: 'Écran',
        color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> {/* Placeholder X, let me fix with proper monitor icon */}
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
            </svg>
        ),
    },
    {
        type: 'TELEPHONE_IP',
        label: 'Téléphone IP',
        color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
        ),
    },
    {
        type: 'AUTRES',
        label: 'Autres',
        color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h9.998c1.08 0 1.975.69 2.4 1.708l3.414 6.545a3.632 3.632 0 01-2.983 4.875H3.383" />
            </svg>
        ),
    },
];

const EquipmentTypeSelectionModal: React.FC<EquipmentTypeSelectionModalProps> = ({ isOpen, onClose, onSelect }) => {
    const { data: availableEquipment, isLoading } = useAvailableEquipment();

    const counts = useMemo(() => {
        const caps: Record<string, number> = {};
        if (availableEquipment) {
            availableEquipment.forEach(eq => {
                // Normaliser le type ou utiliser le type Jira mappé
                let rawType: string = eq.type || '';
                if (!rawType && eq.jiraAttributes?.['Type']) {
                    rawType = String(eq.jiraAttributes['Type']);
                }

                let type = '';
                const lowerType = rawType.toLowerCase();

                // Mapping intelligent
                if (lowerType.includes('laptop') || lowerType === 'pc_portable') type = 'PC_PORTABLE';
                else if (lowerType.includes('desktop') || lowerType === 'pc_fixe') type = 'PC_FIXE';
                else if (lowerType.includes('tablet') || lowerType === 'tablette') type = 'TABLETTE';
                else if (lowerType.includes('mobile') || lowerType === 'phone' || lowerType === 'telephone') type = 'MOBILE';
                else if (lowerType.includes('screen') || lowerType === 'monitor' || lowerType === 'ecran' || lowerType === 'écran') type = 'ECRAN';
                else if (lowerType.includes('ip') && lowerType.includes('phone') || lowerType === 'telephone_ip') type = 'TELEPHONE_IP';
                else if (lowerType === 'autres' || lowerType === 'other') type = 'AUTRES';
                // Tentative de matching direct si standardisé (ex: "PC_PORTABLE" -> "PC_PORTABLE")
                else if (equipmentTypes.some(t => t.type === rawType)) type = rawType as EquipmentType;
                else if (equipmentTypes.some(t => t.type === rawType.toUpperCase())) type = rawType.toUpperCase() as EquipmentType;
                else type = 'AUTRES'; // Fallback

                if (type) {
                    caps[type] = (caps[type] || 0) + 1;
                }
            });
        }
        return caps;
    }, [availableEquipment]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Sélectionnez le type d'équipement"
            size="lg"
        >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-2">
                {equipmentTypes.map((item) => (
                    <button
                        key={item.type}
                        onClick={() => onSelect(item.type)}
                        className="flex flex-col items-center justify-center p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-blue-500 hover:ring-2 hover:ring-blue-500/20 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-all duration-200 group"
                    >
                        <div className={`p-4 rounded-full mb-3 transition-transform duration-200 group-hover:scale-110 ${item.color}`}>
                            {item.icon}
                        </div>
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
                            {item.label}
                        </h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${(counts[item.type] || 0) > 0
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500'
                            }`}>
                            {isLoading ? '...' : `${counts[item.type] || 0} disponibles`}
                        </span>
                    </button>
                ))}
            </div>
        </Modal>
    );
};

export default EquipmentTypeSelectionModal;
