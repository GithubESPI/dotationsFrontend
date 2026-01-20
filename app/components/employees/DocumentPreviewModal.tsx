import React from 'react';
import Modal from '../ui/Modal';
import { EmployeeDocument } from '../../types/employee';
import { useEmployeeDocuments } from '../../hooks/useEmployees';

interface DocumentPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    documents?: EmployeeDocument[]; // Made optional as we'll fetch them
    employeeId: string;
    employeeName: string;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
    isOpen,
    onClose,
    documents: initialDocuments,
    employeeId,
    employeeName,
}) => {
    // Fetch fresh documents specifically using the new hook
    const { data: documentsData, isLoading } = useEmployeeDocuments(employeeId);

    // Use fetched documents if available, otherwise fallback to initial props
    const documents = documentsData || initialDocuments || [];

    console.log('DocumentPreviewModal documents debug:', documents);

    // Trier les documents par date de création (plus récent en premier)
    const sortedDocuments = [...documents].sort((a, b) => {
        // Handle case where document is just an ID string (not populated)
        if (typeof a === 'string' || typeof b === 'string') return 0;

        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
    });

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Date inconnue';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getDocumentIcon = (type: string) => {
        if (!type) return null;
        if (type.toLowerCase().includes('dotation')) {
            return (
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            );
        }
        return (
            <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        );
    };

    const getDocumentLabel = (type: string) => {
        if (!type) return 'Document';
        if (type.toLowerCase().includes('dotation')) return 'Dotation';
        if (type.toLowerCase().includes('restitution')) return 'Restitution';
        return type;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Documents - ${employeeName}`} size="lg">
            <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : sortedDocuments.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700">
                        Aucun document disponible pour cet employé.
                    </div>
                ) : (
                    sortedDocuments.map((doc, index) => {
                        // Skip if doc is just an ID (string)
                        if (typeof doc === 'string') return null;

                        return (
                            <div
                                key={doc._id || index}
                                className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-zinc-50 dark:bg-zinc-700 rounded-lg">
                                        {getDocumentIcon(doc.documentType)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-black dark:text-zinc-50">
                                            {getDocumentLabel(doc.documentType)}
                                        </h4>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                            {formatDate(doc.createdAt)}
                                        </p>
                                        {doc.filename && (
                                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 truncate max-w-[200px] md:max-w-[300px]">
                                                {doc.filename}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <a
                                    href={doc.storageUrl || doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Voir
                                </a>
                            </div>
                        );
                    })
                )}
            </div>
        </Modal>
    );
};

export default DocumentPreviewModal;
