'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useJiraObjectTypeAssets, useSearchJiraAssets } from '../../hooks/useJiraAsset';
import { useJiraAssetStore } from '../../stores/jiraAssetStore';
import { JiraAssetObject } from '../../types/jira-asset';
import { jiraAssetToEquipmentFormData, getAttributeValue, filterAssetsByQuery } from '../../utils/jiraAssetHelpers';
import { useDebounce } from 'use-debounce';

interface JiraAssetSelectorProps {
  onSelect: (asset: JiraAssetObject, formData: any) => void;
  schemaName?: string;
  objectTypeName?: string;
  attributeMapping?: {
    serialNumberAttrId?: string;
    brandAttrId?: string;
    modelAttrId?: string;
    typeAttrId?: string;
    statusAttrId?: string;
    internalIdAttrId?: string;
    assignedUserAttrId?: string;
  };
  placeholder?: string;
  className?: string;
}

const JiraAssetSelector: React.FC<JiraAssetSelectorProps> = ({
  onSelect,
  schemaName = 'Parc Informatique',
  objectTypeName = 'Laptop',
  attributeMapping,
  placeholder = 'Rechercher un équipement dans Jira...',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    selectedSchema,
    selectedObjectType,
    selectedObjectTypeId,
    attributeMapping: storeMapping,
    setSearchQuery: setStoreSearchQuery,
    setSelectedSchema,
    setSelectedObjectType,
    setAttributeMapping,
  } = useJiraAssetStore();

  // Récupérer les assets par type d'objet
  const { data: objectTypeData, isLoading: isLoadingObjectType } = useJiraObjectTypeAssets(
    schemaName,
    objectTypeName,
    !debouncedQuery && isOpen
  );

  // Détecter automatiquement le mapping depuis le premier asset si disponible
  const [autoDetectedMapping, setAutoDetectedMapping] = useState<any>(null);

  // Utiliser le mapping fourni en props, puis celui du store, puis celui auto-détecté
  const mapping = attributeMapping || storeMapping || autoDetectedMapping || {};

  // Détecter automatiquement le mapping depuis les assets récupérés
  useEffect(() => {
    if (!attributeMapping && !storeMapping && objectTypeData?.assets && objectTypeData.assets.length > 0) {
      const firstAsset = objectTypeData.assets[0];
      const detected: any = {};
      
      // Détecter le numéro de série (généralement un code alphanumérique)
      for (const attr of firstAsset.attributes || []) {
        const value = attr.objectAttributeValues?.[0];
        if (!value) continue;
        
        const val = typeof value.value === 'string' ? value.value : String(value.value || '');
        
        // Détecter numéro de série
        if (!detected.serialNumberAttrId && /^[A-Z0-9]{4,20}$/i.test(val)) {
          detected.serialNumberAttrId = attr.objectTypeAttributeId;
        }
        
        // Détecter ID interne (format PI-XXXX)
        if (!detected.internalIdAttrId && /^PI-?\d+$/i.test(val)) {
          detected.internalIdAttrId = attr.objectTypeAttributeId;
        }
        
        // Détecter marque (référence à un objet)
        if (!detected.brandAttrId && value.referencedObject) {
          const refType = value.referencedObject.objectType?.name?.toLowerCase();
          if (refType?.includes('constructeur') || refType?.includes('brand') || refType?.includes('manufacturer')) {
            detected.brandAttrId = attr.objectTypeAttributeId;
          }
        }
        
        // Détecter modèle (pattern commun)
        if (!detected.modelAttrId && val.length > 2) {
          const modelPattern = /^(Precision|Latitude|ThinkPad|MacBook|Surface|EliteBook|ProBook|Inspiron|XPS)/i;
          if (modelPattern.test(val)) {
            detected.modelAttrId = attr.objectTypeAttributeId;
          }
        }
        
        // Détecter statut
        if (!detected.statusAttrId && value.status) {
          detected.statusAttrId = attr.objectTypeAttributeId;
        }
      }
      
      if (Object.keys(detected).length > 0) {
        setAutoDetectedMapping(detected);
        if (!storeMapping) {
          setAttributeMapping(detected);
        }
      }
    }
  }, [objectTypeData?.assets, attributeMapping, storeMapping, setAttributeMapping]);

  // Rechercher des assets si une requête existe
  const { data: searchResults, isLoading: isLoadingSearch } = useSearchJiraAssets(
    {
      objectTypeId: selectedObjectTypeId || objectTypeData?.assets[0]?.objectTypeId || '',
      query: debouncedQuery,
      limit: 50,
    },
    !!debouncedQuery && isOpen && !!selectedObjectTypeId
  );

  // Déterminer les assets à afficher (avec déduplication par ID)
  const assets = useMemo(() => {
    let result: JiraAssetObject[] = [];
    
    if (debouncedQuery && searchResults) {
      result = filterAssetsByQuery(searchResults, debouncedQuery, mapping);
    } else if (objectTypeData?.assets) {
      if (debouncedQuery) {
        result = filterAssetsByQuery(objectTypeData.assets, debouncedQuery, mapping);
      } else {
        result = objectTypeData.assets;
      }
    }
    
    // Dédupliquer les assets par ID pour éviter les clés dupliquées
    const seenIds = new Set<string>();
    return result.filter((asset) => {
      const assetKey = `${asset.id}-${asset.objectKey || ''}-${asset.objectTypeId || ''}`;
      if (seenIds.has(assetKey)) {
        return false;
      }
      seenIds.add(assetKey);
      return true;
    });
  }, [debouncedQuery, searchResults, objectTypeData?.assets, mapping]);

  const isLoading = isLoadingObjectType || isLoadingSearch;

  // Mettre à jour le store quand les props changent
  useEffect(() => {
    if (schemaName !== selectedSchema) {
      setSelectedSchema(schemaName);
    }
    if (objectTypeName !== selectedObjectType) {
      setSelectedObjectType(objectTypeName);
    }
    if (attributeMapping && !storeMapping) {
      setAttributeMapping(attributeMapping);
    }
  }, [schemaName, objectTypeName, attributeMapping, selectedSchema, selectedObjectType, storeMapping, setSelectedSchema, setSelectedObjectType, setAttributeMapping]);

  // Gérer les touches du clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < assets.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0 && assets[selectedIndex]) {
        e.preventDefault();
        handleSelectAsset(assets[selectedIndex]);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
        setSelectedIndex(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, assets, selectedIndex]);

  // Scroll vers l'élément sélectionné
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const handleSelectAsset = (asset: JiraAssetObject) => {
    const formData = jiraAssetToEquipmentFormData(asset, mapping);
    onSelect(asset, formData);
    setIsOpen(false);
    setSearchQuery('');
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const getAssetDisplayName = (asset: JiraAssetObject): string => {
    const serialNumber = mapping.serialNumberAttrId
      ? getAttributeValue(asset, mapping.serialNumberAttrId)
      : null;
    const brand = mapping.brandAttrId ? getAttributeValue(asset, mapping.brandAttrId) : null;
    const model = mapping.modelAttrId ? getAttributeValue(asset, mapping.modelAttrId) : null;
    const internalId = mapping.internalIdAttrId
      ? getAttributeValue(asset, mapping.internalIdAttrId)
      : null;

    const parts = [];
    if (internalId) parts.push(internalId);
    if (brand) parts.push(brand);
    if (model) parts.push(model);
    if (serialNumber) parts.push(`SN: ${serialNumber}`);

    return parts.length > 0 ? parts.join(' - ') : asset.objectKey || asset.id;
  };

  const getAssetSubtitle = (asset: JiraAssetObject): string => {
    const parts = [];
    if (asset.objectKey) parts.push(`Key: ${asset.objectKey}`);
    parts.push(`ID: ${asset.id}`);
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
            setStoreSearchQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setStoreSearchQuery('');
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
                  Recherche en cours...
                </p>
              </div>
            ) : assets.length === 0 ? (
              <div className="p-4 text-center text-zinc-600 dark:text-zinc-400">
                {debouncedQuery ? (
                  <>
                    <p className="font-medium">Aucun équipement trouvé</p>
                    <p className="text-sm mt-1">Essayez une autre recherche</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">Commencez à taper pour rechercher</p>
                    <p className="text-sm mt-1">Les équipements de Jira apparaîtront ici</p>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="p-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700">
                  {assets.length} équipement{assets.length > 1 ? 's' : ''} trouvé{assets.length > 1 ? 's' : ''}
                </div>
                {assets.map((asset, index) => {
                  const serialNumber = mapping.serialNumberAttrId
                    ? getAttributeValue(asset, mapping.serialNumberAttrId)
                    : null;
                  const brand = mapping.brandAttrId ? getAttributeValue(asset, mapping.brandAttrId) : null;
                  const model = mapping.modelAttrId ? getAttributeValue(asset, mapping.modelAttrId) : null;

                  // Créer une clé unique en combinant plusieurs propriétés pour éviter les doublons
                  const uniqueKey = `jira-asset-${asset.id}-${asset.objectKey || 'no-key'}-${asset.objectTypeId || 'no-type'}-${index}`;

                  return (
                    <button
                      key={uniqueKey}
                      type="button"
                      onClick={() => handleSelectAsset(asset)}
                      className={`w-full text-left p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-100 dark:border-zinc-800 last:border-0 ${
                        index === selectedIndex
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-black dark:text-zinc-50 truncate">
                            {getAssetDisplayName(asset)}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            {getAssetSubtitle(asset)}
                          </p>
                          {(brand || model || serialNumber) && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {brand && (
                                <span className="px-2 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                  {brand}
                                </span>
                              )}
                              {model && (
                                <span className="px-2 py-1 text-xs rounded bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                                  {model}
                                </span>
                              )}
                              {serialNumber && (
                                <span className="px-2 py-1 text-xs rounded bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-mono">
                                  {serialNumber}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
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
                      </div>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default JiraAssetSelector;

