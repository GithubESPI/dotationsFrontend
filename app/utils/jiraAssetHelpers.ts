import { JiraAssetObject, AttributeMapping } from '../types/jira-asset';

/**
 * Extraire la valeur d'un attribut depuis un objet Jira Asset
 */
export const getAttributeValue = (
  asset: JiraAssetObject,
  attributeId?: string
): string | undefined => {
  if (!attributeId) return undefined;
  
  const attr = asset.attributes.find((a) => a.objectTypeAttributeId === attributeId);
  if (!attr || !attr.objectAttributeValues || attr.objectAttributeValues.length === 0) {
    return undefined;
  }

  const value = attr.objectAttributeValues[0];
  
  // Si c'est une valeur simple (string, number, boolean)
  if (typeof value.value === 'string' || typeof value.value === 'number' || typeof value.value === 'boolean') {
    return String(value.value);
  }
  
  // Si c'est un objet référencé, essayer d'extraire le nom ou l'ID
  if (value.referencedObject) {
    return value.referencedObject.objectKey || value.referencedObject.id || undefined;
  }
  
  // Si c'est un statut, extraire le nom
  if (value.status) {
    return value.status.name || value.status.id || undefined;
  }
  
  return undefined;
};

/**
 * Extraire toutes les valeurs d'un attribut (pour les attributs multi-valeurs)
 */
export const getAttributeValues = (
  asset: JiraAssetObject,
  attributeId?: string
): string[] => {
  if (!attributeId) return [];
  
  const attr = asset.attributes.find((a) => a.objectTypeAttributeId === attributeId);
  if (!attr || !attr.objectAttributeValues || attr.objectAttributeValues.length === 0) {
    return [];
  }

  return attr.objectAttributeValues
    .map((value) => {
      if (typeof value.value === 'string' || typeof value.value === 'number' || typeof value.value === 'boolean') {
        return String(value.value);
      }
      if (value.referencedObject) {
        return value.referencedObject.objectKey || value.referencedObject.id || '';
      }
      if (value.status) {
        return value.status.name || value.status.id || '';
      }
      return '';
    })
    .filter((v) => v !== '');
};

/**
 * Convertir un objet Jira Asset en données d'équipement pour le formulaire
 */
export const jiraAssetToEquipmentFormData = (
  asset: JiraAssetObject,
  mapping: AttributeMapping
): {
  jiraAssetId: string;
  serialNumber?: string;
  brand?: string;
  model?: string;
  type?: string;
  internalId?: string;
  status?: string;
  assignedUserEmail?: string;
} => {
  return {
    jiraAssetId: asset.id,
    serialNumber: getAttributeValue(asset, mapping.serialNumberAttrId),
    brand: getAttributeValue(asset, mapping.brandAttrId),
    model: getAttributeValue(asset, mapping.modelAttrId),
    type: getAttributeValue(asset, mapping.typeAttrId),
    internalId: getAttributeValue(asset, mapping.internalIdAttrId),
    status: getAttributeValue(asset, mapping.statusAttrId),
    assignedUserEmail: getAttributeValue(asset, mapping.assignedUserAttrId),
  };
};

/**
 * Obtenir tous les attributs disponibles d'un objet Jira Asset avec leurs labels
 */
export const getAvailableAttributes = (asset: JiraAssetObject): Array<{
  id: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'reference' | 'status';
}> => {
  return asset.attributes.map((attr) => {
    const value = attr.objectAttributeValues?.[0];
    let type: 'string' | 'number' | 'boolean' | 'reference' | 'status' = 'string';
    let displayValue = '';

    if (value) {
      if (typeof value.value === 'string') {
        type = 'string';
        displayValue = value.value;
      } else if (typeof value.value === 'number') {
        type = 'number';
        displayValue = String(value.value);
      } else if (typeof value.value === 'boolean') {
        type = 'boolean';
        displayValue = String(value.value);
      } else if (value.referencedObject) {
        type = 'reference';
        displayValue = value.referencedObject.objectKey || value.referencedObject.id || '';
      } else if (value.status) {
        type = 'status';
        displayValue = value.status.name || value.status.id || '';
      }
    }

    return {
      id: attr.objectTypeAttributeId,
      value: displayValue,
      type,
    };
  });
};

/**
 * Filtrer les assets par recherche textuelle
 */
export const filterAssetsByQuery = (
  assets: JiraAssetObject[],
  query: string,
  mapping?: AttributeMapping
): JiraAssetObject[] => {
  if (!query.trim()) return assets;

  const lowerQuery = query.toLowerCase();

  return assets.filter((asset) => {
    // Rechercher dans le numéro de série
    const serialNumber = mapping?.serialNumberAttrId
      ? getAttributeValue(asset, mapping.serialNumberAttrId)
      : undefined;
    if (serialNumber?.toLowerCase().includes(lowerQuery)) return true;

    // Rechercher dans la marque
    const brand = mapping?.brandAttrId ? getAttributeValue(asset, mapping.brandAttrId) : undefined;
    if (brand?.toLowerCase().includes(lowerQuery)) return true;

    // Rechercher dans le modèle
    const model = mapping?.modelAttrId ? getAttributeValue(asset, mapping.modelAttrId) : undefined;
    if (model?.toLowerCase().includes(lowerQuery)) return true;

    // Rechercher dans l'ID interne
    const internalId = mapping?.internalIdAttrId
      ? getAttributeValue(asset, mapping.internalIdAttrId)
      : undefined;
    if (internalId?.toLowerCase().includes(lowerQuery)) return true;

    // Rechercher dans l'objectKey
    if (asset.objectKey?.toLowerCase().includes(lowerQuery)) return true;

    // Rechercher dans tous les attributs si pas de mapping
    if (!mapping) {
      const allAttributes = getAvailableAttributes(asset);
      return allAttributes.some((attr) => attr.value.toLowerCase().includes(lowerQuery));
    }

    return false;
  });
};

