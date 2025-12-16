import { z } from 'zod';

// Schéma Zod pour un employé
export const EmployeeSchema = z.object({
  _id: z.string(),
  office365Id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  givenName: z.string().optional(),
  surname: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  officeLocation: z.string().optional(),
  mobilePhone: z.string().optional(),
  profilePicture: z.string().optional(),
  isActive: z.boolean(),
  lastSync: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Employee = z.infer<typeof EmployeeSchema>;

// Schéma pour la recherche d'employés
export const SearchEmployeeParamsSchema = z.object({
  query: z.string().optional(),
  department: z.string().optional(),
  officeLocation: z.string().optional(),
  isActive: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export type SearchEmployeeParams = z.infer<typeof SearchEmployeeParamsSchema>;

// Schéma pour la réponse de recherche paginée
export const PaginatedEmployeesResponseSchema = z.object({
  data: z.array(EmployeeSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type PaginatedEmployeesResponse = z.infer<typeof PaginatedEmployeesResponseSchema>;

// Schéma pour les statistiques
export const EmployeeStatsSchema = z.object({
  total: z.number(),
  active: z.number(),
  inactive: z.number(),
  byDepartment: z.array(
    z.object({
      _id: z.string().nullable(),
      count: z.number(),
    })
  ),
});

export type EmployeeStats = z.infer<typeof EmployeeStatsSchema>;

// Schéma pour la synchronisation
export const SyncResponseSchema = z.object({
  synced: z.number(),
  errors: z.number(),
  skipped: z.number(),
});

export type SyncResponse = z.infer<typeof SyncResponseSchema>;

