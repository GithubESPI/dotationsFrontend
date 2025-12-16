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
  officePhone: z.string().optional(),
  businessPhones: z.array(z.string()).optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  streetAddress: z.string().optional(),
  state: z.string().optional(),
  companyName: z.string().optional(),
  employeeId: z.string().optional(),
  employeeType: z.string().optional(),
  employeeHireDate: z.string().optional(),
  managerId: z.string().optional(),
  managerDisplayName: z.string().optional(),
  managerEmail: z.string().optional(),
  officeName: z.string().optional(),
  division: z.string().optional(),
  costCenter: z.string().optional(),
  businessUnit: z.string().optional(),
  employeeNumber: z.string().optional(),
  preferredLanguage: z.string().optional(),
  usageLocation: z.string().optional(),
  userType: z.string().optional(),
  accountEnabled: z.boolean().optional(),
  employeeOrgData: z.object({
    costCenter: z.string().optional(),
    division: z.string().optional(),
  }).optional(),
  onPremisesExtensionAttributes: z.record(z.string().optional()).optional(),
  profilePicture: z.string().optional(),
  profilePictureUrl: z.string().optional(),
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

