import { z } from 'zod';
import { EquipmentTypeSchema } from './equipment';

// Enum pour le statut d'allocation
export const AllocationStatusSchema = z.enum([
  'EN_COURS',
  'TERMINEE',
  'EN_RETARD',
  'ANNULEE',
]);

export type AllocationStatus = z.infer<typeof AllocationStatusSchema>;

// Schéma pour un équipement dans une allocation
export const EquipmentItemSchema = z.object({
  equipmentId: z.string().optional(), // Optionnel car peut venir de Jira sans être dans MongoDB
  internalId: z.string().optional(),
  type: z.string().optional(),
  brand: z.string().optional(), // Marque de l'équipement
  model: z.string().optional(), // Modèle de l'équipement
  serialNumber: z.string().optional(), // Optionnel si equipmentId est présent
  jiraAssetId: z.string().optional(), // ID de l'asset Jira si sélectionné depuis Jira
  deliveredDate: z.string().optional(),
  condition: z.string().optional().default('bon_etat'),
}).refine(
  (data) => {
    // Au moins un des deux doit être présent
    return !!(data.equipmentId || (data.serialNumber && data.serialNumber.trim().length > 0));
  },
  {
    message: 'Vous devez sélectionner un équipement depuis Jira ou dans le système',
    path: ['equipmentId'],
  }
);

export type EquipmentItem = z.infer<typeof EquipmentItemSchema>;

// Schéma pour créer une allocation
export const CreateAllocationSchema = z.object({
  userId: z.string().min(1, 'L\'ID utilisateur est requis'),
  equipments: z
    .array(EquipmentItemSchema)
    .min(1, 'Au moins un équipement est requis'),
  deliveryDate: z.string().optional(),
  accessories: z.array(z.string()).optional(),
  additionalSoftware: z.array(z.string()).optional(),
  services: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export type CreateAllocation = z.infer<typeof CreateAllocationSchema>;

// Schéma pour une allocation complète
export const AllocationSchema = z.object({
  _id: z.string(),
  userId: z.union([z.string(), z.object({ _id: z.string(), displayName: z.string(), email: z.string() })]),
  userName: z.string(),
  userEmail: z.string(),
  equipments: z.array(
    z.object({
      equipmentId: z.union([
        z.string(),
        z.object({
          _id: z.string(),
          brand: z.string(),
          model: z.string(),
          serialNumber: z.string(),
          type: z.string().optional(),
        }),
      ]),
      internalId: z.string().optional(),
      type: z.string().optional(),
      serialNumber: z.string().optional(),
      deliveredDate: z.string().optional(),
      condition: z.string().optional(),
    })
  ),
  deliveryDate: z.string(),
  status: AllocationStatusSchema,
  accessories: z.array(z.string()).optional(),
  additionalSoftware: z.array(z.string()).optional(),
  standardSoftware: z.array(z.string()).optional(),
  services: z.array(z.string()).optional(),
  notes: z.string().optional(),
  signatureData: z
    .object({
      signerName: z.string(),
      signatureImage: z.string(),
      timestamp: z.string(),
    })
    .optional(),
  signedAt: z.string().optional().nullable(),
  createdBy: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Allocation = z.infer<typeof AllocationSchema>;

// Schéma pour la recherche d'allocations
export const SearchAllocationParamsSchema = z.object({
  query: z.string().optional(),
  userId: z.string().optional(),
  status: AllocationStatusSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export type SearchAllocationParams = z.infer<typeof SearchAllocationParamsSchema>;

// Schéma pour la réponse de recherche paginée
export const PaginatedAllocationResponseSchema = z.object({
  data: z.array(AllocationSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type PaginatedAllocationResponse = z.infer<typeof PaginatedAllocationResponseSchema>;

// Schéma pour signer une allocation
export const SignAllocationSchema = z.object({
  signerName: z.string().min(1, 'Le nom du signataire est requis'),
  signatureImage: z.string().min(1, 'La signature est requise'),
});

export type SignAllocation = z.infer<typeof SignAllocationSchema>;

