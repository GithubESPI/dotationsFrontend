'use client';
import React from 'react';
import Modal from '../ui/Modal';
import { Employee } from '../../types/employee';
import { useAllocationsByUserId } from '../../hooks/useAllocations';
import ReturnFormModal from '../returns/ReturnFormModal';
import { useState } from 'react';
import { Allocation } from '../../types/allocation';

interface EmployeeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

import { useEmployee, useEmployeeDocuments } from '../../hooks/useEmployees';

const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({
  isOpen,
  onClose,
  employee: initialEmployee,
}) => {
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);

  // Utiliser les données initiales pour l'affichage principal
  const { data: fetchedEmployee } = useEmployee(initialEmployee?._id);
  const employee = fetchedEmployee || initialEmployee;

  // Récupérer les documents séparément via le nouveau hook
  const { data: documents } = useEmployeeDocuments(employee?._id);

  const { data: allocations, isLoading: isLoadingAllocations } = useAllocationsByUserId(employee?._id);

  if (!employee) return null;

  // Générer des initiales
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Générer une couleur de fond basée sur le nom
  const getAvatarColor = (name: string): string => {
    const colors = [
      'bg-gradient-to-br from-purple-500 to-pink-500',
      'bg-gradient-to-br from-blue-500 to-cyan-500',
      'bg-gradient-to-br from-green-500 to-emerald-500',
      'bg-gradient-to-br from-orange-500 to-red-500',
      'bg-gradient-to-br from-indigo-500 to-purple-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Formater une date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Non renseigné';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Section d'information réutilisable
  const InfoSection = ({
    title,
    children,
    icon,
  }: {
    title: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
  }) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-black dark:text-zinc-50 mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4">
        {children}
      </div>
    </div>
  );

  // Item d'information réutilisable
  const InfoItem = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: string | undefined | null;
    icon?: React.ReactNode;
  }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-3 py-2 border-b border-zinc-200 dark:border-zinc-700 last:border-0">
        {icon && (
          <div className="flex-shrink-0 w-5 h-5 text-zinc-400 dark:text-zinc-500 mt-0.5">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            {label}
          </p>
          <p className="text-sm text-black dark:text-zinc-50 break-words">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails de l'employé" size="xl">
      <div className="max-h-[80vh] overflow-y-auto">
        {/* En-tête avec photo */}
        <div className="flex items-start gap-6 mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-700">
          <div className="relative flex-shrink-0">
            <div
              className={`w-24 h-24 rounded-2xl border-4 border-zinc-200 dark:border-zinc-700 shadow-lg overflow-hidden ${employee.profilePicture || employee.profilePictureUrl
                ? ''
                : getAvatarColor(employee.displayName)
                }`}
            >
              {employee.profilePicture || employee.profilePictureUrl ? (
                <img
                  src={employee.profilePicture || employee.profilePictureUrl}
                  alt={employee.displayName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const fallbackDiv = document.createElement('div');
                      fallbackDiv.className = 'w-full h-full flex items-center justify-center text-white text-2xl font-bold';
                      fallbackDiv.textContent = getInitials(employee.displayName);
                      parent.appendChild(fallbackDiv);
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                  {getInitials(employee.displayName)}
                </div>
              )}
            </div>
            {employee.isActive && (
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-green-500 border-4 border-white dark:border-zinc-900 shadow-lg"></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-black dark:text-zinc-50 mb-1">
              {employee.displayName}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">{employee.email}</p>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${employee.isActive
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                  }`}
              >
                {employee.isActive ? 'Actif' : 'Inactif'}
              </span>
              {employee.accountEnabled === false && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                  Compte désactivé
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations personnelles */}
          <InfoSection
            title="Informations personnelles"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            }
          >
            <InfoItem label="Prénom" value={employee.givenName} />
            <InfoItem label="Nom" value={employee.surname} />
            <InfoItem label="Nom complet" value={employee.displayName} />
            <InfoItem label="Email" value={employee.email} />
            <InfoItem label="Téléphone mobile" value={employee.mobilePhone} />
            <InfoItem label="Téléphone bureau" value={employee.officePhone} />
            {employee.businessPhones && employee.businessPhones.length > 0 && (
              <InfoItem
                label="Téléphones professionnels"
                value={employee.businessPhones.join(', ')}
              />
            )}
          </InfoSection>

          {/* Informations professionnelles */}
          <InfoSection
            title="Informations professionnelles"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            }
          >
            <InfoItem label="Poste" value={employee.jobTitle} />
            <InfoItem label="Département" value={employee.department} />
            <InfoItem label="Division" value={employee.division} />
            <InfoItem label="Unité commerciale" value={employee.businessUnit} />
            <InfoItem label="Type d'employé" value={employee.employeeType} />
            <InfoItem label="ID Employé" value={employee.employeeId} />
            <InfoItem label="Numéro d'employé" value={employee.employeeNumber} />
            <InfoItem label="Date d'embauche" value={formatDate(employee.employeeHireDate)} />
            <InfoItem label="Entreprise" value={employee.companyName} />
          </InfoSection>

          {/* Localisation */}
          <InfoSection
            title="Localisation"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            }
          >
            <InfoItem label="Bureau" value={employee.officeName} />
            <InfoItem label="Localisation" value={employee.officeLocation} />
            <InfoItem label="Adresse" value={employee.streetAddress} />
            <InfoItem label="Ville" value={employee.city} />
            <InfoItem label="Code postal" value={employee.postalCode} />
            <InfoItem label="État/Région" value={employee.state} />
            <InfoItem label="Pays" value={employee.country} />
          </InfoSection>

          {/* Informations organisationnelles */}
          <InfoSection
            title="Informations organisationnelles"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            }
          >
            <InfoItem label="Centre de coût" value={employee.costCenter} />
            {employee.employeeOrgData?.costCenter && (
              <InfoItem
                label="Centre de coût (org)"
                value={employee.employeeOrgData.costCenter}
              />
            )}
            {employee.employeeOrgData?.division && (
              <InfoItem label="Division (org)" value={employee.employeeOrgData.division} />
            )}
            <InfoItem label="Langue préférée" value={employee.preferredLanguage} />
            <InfoItem label="Localisation d'utilisation" value={employee.usageLocation} />
            <InfoItem label="Type d'utilisateur" value={employee.userType} />
          </InfoSection>

          {/* Manager */}
          {(employee.managerId || employee.managerDisplayName || employee.managerEmail) && (
            <InfoSection
              title="Manager"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              }
            >
              <InfoItem label="Nom du manager" value={employee.managerDisplayName} />
              <InfoItem label="Email du manager" value={employee.managerEmail} />
              <InfoItem label="ID Manager" value={employee.managerId} />
            </InfoSection>
          )}

          {/* Informations système */}
          <InfoSection
            title="Informations système"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            }
          >
            <InfoItem label="ID Office 365" value={employee.office365Id} />
            <InfoItem label="ID MongoDB" value={employee._id} />
            <InfoItem label="Dernière synchronisation" value={formatDate(employee.lastSync)} />
            <InfoItem label="Date de création" value={formatDate(employee.createdAt)} />
            <InfoItem label="Date de création" value={formatDate(employee.createdAt)} />
            <InfoItem label="Dernière mise à jour" value={formatDate(employee.updatedAt)} />
          </InfoSection>
        </div>

        {/* Section Allocations */}
        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700">
          <h3 className="text-xl font-bold text-black dark:text-zinc-50 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Allocations & Matériel
          </h3>

          {isLoadingAllocations ? (
            <div className="p-4 text-center text-zinc-500">Chargement des allocations...</div>
          ) : allocations && allocations.length > 0 ? (
            <div className="space-y-4">
              {allocations.map((allocation: any) => (
                <div key={allocation._id} className="bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg text-black dark:text-white">
                        Allocation du {formatDate(allocation.deliveryDate)}
                      </h4>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${['EN_COURS', 'en_cours'].includes(allocation.status) ? 'bg-green-100 text-green-800' :
                        ['TERMINEE', 'terminee'].includes(allocation.status) ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                        {allocation.status === 'en_cours' ? 'En cours' : allocation.status === 'terminee' ? 'Terminée' : allocation.status}
                      </span>
                    </div>
                    {(['EN_COURS', 'en_cours', 'EN_RETARD', 'en_retard'].includes(allocation.status)) && (
                      <button
                        onClick={() => setSelectedAllocation(allocation)}
                        className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Restituer
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {allocation.equipments.map((eq: any, idx: number) => (
                      <div key={idx} className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3 text-sm border border-zinc-200 dark:border-zinc-800">
                        <div className="font-medium text-black dark:text-white">
                          {(eq.equipmentId?.brand || '')} {(eq.equipmentId?.model || '')}
                        </div>
                        <div className="text-zinc-500 text-xs mt-1">
                          S/N: {eq.serialNumber || eq.equipmentId?.serialNumber || 'N/A'}
                        </div>
                        <div className="text-zinc-500 text-xs">
                          ID: {eq.internalId || eq.equipmentId?.internalId || 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700">
              <p className="text-zinc-500">Aucune allocation trouvée pour cet employé.</p>
            </div>
          )}
        </div>


        {/* Section Documents */}
        {documents && documents.length > 0 && (
          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700">
            <h3 className="text-xl font-bold text-black dark:text-zinc-50 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Documents associés
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.sort((a, b) => (new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())).map((doc) => (
                <div key={doc._id} className="bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${(doc.documentType || '').toLowerCase().includes('dotation') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white text-sm">
                        {(doc.documentType || 'Document').charAt(0).toUpperCase() + (doc.documentType || 'Document').slice(1)}
                      </h4>
                      <p className="text-xs text-zinc-500">
                        {new Date(doc.createdAt || '').toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <a
                    href={doc.storageUrl || doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 rounded-lg transition-colors"
                    title="Voir le document"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attributs d'extension personnalisés */}
        {employee.onPremisesExtensionAttributes &&
          Object.keys(employee.onPremisesExtensionAttributes).length > 0 && (
            <InfoSection
              title="Attributs d'extension personnalisés"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              }
            >
              <div className="space-y-2">
                {Object.entries(employee.onPremisesExtensionAttributes).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <div
                      key={key}
                      className="flex items-start gap-3 py-2 border-b border-zinc-200 dark:border-zinc-700 last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                          {key}
                        </p>
                        <p className="text-sm text-black dark:text-zinc-50 break-words">
                          {value as string}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </InfoSection>
          )}
      </div>

      {selectedAllocation && (
        <ReturnFormModal
          isOpen={!!selectedAllocation}
          onClose={() => setSelectedAllocation(null)}
          allocation={selectedAllocation}
        />
      )}
    </Modal>
  );
};

export default EmployeeDetailsModal;

