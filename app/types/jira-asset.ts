import { z } from 'zod';

// Schéma pour un attribut Jira Asset
export const JiraAssetAttributeSchema = z.object({
  objectTypeAttributeId: z.string(),
  objectAttributeValues: z.array(
    z.object({
      value: z.union([z.string(), z.number(), z.boolean(), z.record(z.any())]),
      referencedType: z.string().optional(),
      referencedObject: z
        .object({
          id: z.string().optional(),
          objectKey: z.string().optional(),
          objectType: z
            .object({
              id: z.string().optional(),
              name: z.string().optional(),
            })
            .optional(),
        })
        .optional(),
      status: z
        .object({
          id: z.string().optional(),
          name: z.string().optional(),
          category: z.string().optional(),
        })
        .optional(),
    })
  ),
});

export type JiraAssetAttribute = z.infer<typeof JiraAssetAttributeSchema>;

// Schéma pour un objet Jira Asset
export const JiraAssetObjectSchema = z.object({
  id: z.string(),
  objectKey: z.string().optional(),
  objectTypeId: z.string(),
  attributes: z.array(JiraAssetAttributeSchema),
});

export type JiraAssetObject = z.infer<typeof JiraAssetObjectSchema>;

// Schéma pour la réponse de recherche d'assets
export const JiraAssetSearchResponseSchema = z.object({
  values: z.array(JiraAssetObjectSchema),
  size: z.number().optional(),
  start: z.number().optional(),
  limit: z.number().optional(),
});

export type JiraAssetSearchResponse = z.infer<typeof JiraAssetSearchResponseSchema>;

// Schéma pour le workspace ID
export const JiraWorkspaceResponseSchema = z.object({
  workspaceId: z.string(),
});

export type JiraWorkspaceResponse = z.infer<typeof JiraWorkspaceResponseSchema>;

// Schéma pour la réponse de récupération d'un schéma
export const JiraSchemaResponseSchema = z.object({
  schemaName: z.string(),
  count: z.number(),
  assets: z.array(JiraAssetObjectSchema),
});

export type JiraSchemaResponse = z.infer<typeof JiraSchemaResponseSchema>;

// Schéma pour la réponse de récupération par type d'objet
export const JiraObjectTypeResponseSchema = z.object({
  schemaName: z.string(),
  objectTypeName: z.string(),
  count: z.number(),
  assets: z.array(JiraAssetObjectSchema),
});

export type JiraObjectTypeResponse = z.infer<typeof JiraObjectTypeResponseSchema>;

// Schéma pour la recherche d'assets
export const SearchJiraAssetsParamsSchema = z.object({
  objectTypeId: z.string(),
  query: z.string().optional(),
  limit: z.number().min(1).max(1000).default(50),
});

export type SearchJiraAssetsParams = z.infer<typeof SearchJiraAssetsParamsSchema>;

// Schéma pour le mapping d'attributs
export const AttributeMappingSchema = z.object({
  serialNumberAttrId: z.string().optional(),
  brandAttrId: z.string().optional(),
  modelAttrId: z.string().optional(),
  typeAttrId: z.string().optional(),
  statusAttrId: z.string().optional(),
  internalIdAttrId: z.string().optional(),
  assignedUserAttrId: z.string().optional(),
});

export type AttributeMapping = z.infer<typeof AttributeMappingSchema>;

// Schéma pour la synchronisation de laptops
export const SyncLaptopsParamsSchema = z.object({
  schemaName: z.string().optional().default('Parc Informatique'),
  objectTypeName: z.string().optional().default('Laptop'),
  limit: z.number().min(1).max(10000).optional().default(1000),
  autoDetectAttributes: z.boolean().optional().default(true),
  attributeMapping: AttributeMappingSchema.optional(),
});

export type SyncLaptopsParams = z.infer<typeof SyncLaptopsParamsSchema>;

// Schéma pour la réponse de synchronisation
export const SyncResponseSchema = z.object({
  created: z.number(),
  updated: z.number(),
  skipped: z.number().optional(),
  errors: z.number(),
  total: z.number().optional(),
  attributeMapping: AttributeMappingSchema.optional(),
});

export type SyncResponse = z.infer<typeof SyncResponseSchema>;

