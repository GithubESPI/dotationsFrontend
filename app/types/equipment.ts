import { z } from 'zod';

// Enum pour le type d'équipement
export const EquipmentTypeSchema = z.enum([
  'PC_PORTABLE',
  'PC_FIXE',
  'TABLETTE',
  'MOBILE',
  'ECRAN',
  'TELEPHONE_IP',
  'AUTRES',
]);

export type EquipmentType = z.infer<typeof EquipmentTypeSchema>;

// Enum pour le statut d'équipement
export const EquipmentStatusSchema = z.enum([
  'DISPONIBLE',
  'AFFECTE',
  'EN_REPARATION',
  'RESTITUE',
  'PERDU',
  'DETRUIT',
]);

export type EquipmentStatus = z.infer<typeof EquipmentStatusSchema>;

// Schéma pour un équipement
export const EquipmentSchema = z.object({
  _id: z.string(),
  jiraAssetId: z.string().optional(),
  internalId: z.string().optional(),
  type: EquipmentTypeSchema,
  brand: z.string(),
  model: z.string(),
  serialNumber: z.string(),
  imei: z.string().optional(),
  phoneLine: z.string().optional(),
  status: EquipmentStatusSchema,
  currentUserId: z.string().optional().nullable(),
  location: z.string().optional(),
  additionalSoftwares: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Equipment = z.infer<typeof EquipmentSchema>;

// Schéma pour la recherche d'équipements
export const SearchEquipmentParamsSchema = z.object({
  query: z.string().optional(),
  type: EquipmentTypeSchema.optional(),
  status: EquipmentStatusSchema.optional(),
  brand: z.string().optional(),
  location: z.string().optional(),
  currentUserId: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export type SearchEquipmentParams = z.infer<typeof SearchEquipmentParamsSchema>;

// Schéma pour la réponse de recherche paginée
export const PaginatedEquipmentResponseSchema = z.object({
  data: z.array(EquipmentSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type PaginatedEquipmentResponse = z.infer<typeof PaginatedEquipmentResponseSchema>;

// Schéma pour les statistiques d'équipements
export const EquipmentStatsSchema = z.object({
  total: z.number(),
  byStatus: z.object({
    disponible: z.number(),
    affecte: z.number(),
    enReparation: z.number(),
    restitue: z.number(),
    perdu: z.number(),
    detruit: z.number(),
  }),
  byType: z.array(
    z.object({
      _id: z.string(),
      count: z.number(),
    })
  ),
  byBrand: z.array(
    z.object({
      _id: z.string(),
      count: z.number(),
    })
  ),
});

export type EquipmentStats = z.infer<typeof EquipmentStatsSchema>;

// Schéma pour créer un équipement
export const CreateEquipmentSchema = z.object({
  jiraAssetId: z.string().optional(),
  internalId: z.string().optional(),
  type: EquipmentTypeSchema,
  brand: z.string().min(1, 'La marque est requise'),
  model: z.string().min(1, 'Le modèle est requis'),
  serialNumber: z.string().min(1, 'Le numéro de série est requis'),
  imei: z.string().optional(),
  phoneLine: z.string().optional(),
  status: EquipmentStatusSchema.optional(),
  currentUserId: z.string().optional(),
  location: z.string().optional(),
  additionalSoftwares: z.array(z.string()).optional(),
});

export type CreateEquipment = z.infer<typeof CreateEquipmentSchema>;

