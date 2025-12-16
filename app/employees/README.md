# Module Employés - Frontend

## 📋 Vue d'ensemble

Module complet de gestion des employés avec recherche avancée, synchronisation Office 365, et interface moderne.

## 🏗️ Architecture

### Technologies utilisées
- **React Query** : Gestion des données avec cache et synchronisation
- **Zustand** : State management pour les filtres de recherche
- **Zod** : Validation des types et schémas
- **Axios** : Appels API via `axiosInstance`

### Structure des fichiers

```
app/
├── employees/
│   ├── page.tsx              # Page principale de gestion des employés
│   └── README.md             # Documentation
├── components/employees/
│   ├── SearchBar.tsx         # Grande barre de recherche style Google
│   ├── EmployeeCard.tsx      # Carte d'affichage d'un employé
│   ├── EmployeeFilters.tsx  # Filtres (département, statut)
│   └── EmployeeStats.tsx     # Statistiques des employés
├── hooks/
│   └── useEmployees.ts       # Hooks React Query pour les employés
├── stores/
│   └── employeeSearchStore.ts # Store Zustand pour la recherche
├── api/
│   └── employees.ts          # Service API pour les employés
└── types/
    └── employee.ts           # Types TypeScript et schémas Zod
```

## 🎯 Fonctionnalités

### Recherche
- **Barre de recherche grande** style Google avec debounce automatique (500ms)
- Recherche par nom, prénom, email ou département
- Recherche en temps réel avec debounce pour optimiser les performances

### Filtres
- Filtre par département (dynamique depuis les stats)
- Filtre par statut (actif/inactif)
- Réinitialisation des filtres en un clic

### Synchronisation
- Synchronisation depuis Office 365 avec un seul clic
- Affichage des résultats (synced, errors, skipped)
- Invalidation automatique du cache après synchronisation

### Affichage
- Grille responsive (1 colonne mobile, 2 tablette, 3 desktop)
- Cartes avec effet MagicContainer
- Pagination avec navigation fluide
- Statistiques en temps réel

## 🔌 API Endpoints utilisés

Tous les endpoints utilisent `axiosInstance` qui gère automatiquement :
- L'authentification JWT
- Les erreurs 401 (redirection vers login)
- Les cookies CORS

### Endpoints disponibles

```typescript
// Recherche avec filtres et pagination
GET /employees?query=nom&department=IT&page=1&limit=20

// Tous les employés actifs
GET /employees/all

// Statistiques
GET /employees/stats

// Détails d'un employé
GET /employees/:id

// Synchronisation Office 365
POST /employees/sync

// Mise à jour
PUT /employees/:id

// Désactivation
DELETE /employees/:id
```

## 📦 Hooks React Query

### `useEmployeesSearch(params)`
Recherche d'employés avec filtres et pagination.

```tsx
const { data, isLoading, error } = useEmployeesSearch({
  query: 'john',
  department: 'IT',
  page: 1,
  limit: 20,
});
```

### `useEmployeeStats()`
Récupère les statistiques des employés.

```tsx
const { data: stats } = useEmployeeStats();
// stats: { total, active, inactive, byDepartment }
```

### `useSyncEmployees()`
Mutation pour synchroniser depuis Office 365.

```tsx
const syncMutation = useSyncEmployees();
await syncMutation.mutateAsync();
```

## 🗄️ Store Zustand

Le store `useEmployeeSearchStore` gère l'état de recherche :

```tsx
const { searchParams, setQuery, setDepartment, resetFilters } = 
  useEmployeeSearchStore();
```

## 🎨 Composants

### SearchBar
Grande barre de recherche style Google avec :
- Debounce automatique (500ms)
- Icône de recherche animée
- Bouton effacer
- Focus automatique optionnel

### EmployeeCard
Carte d'affichage avec :
- Avatar avec initiales ou photo
- Informations complètes (nom, email, poste, département, localisation)
- Badge de statut (actif/inactif)
- Actions (désactivation)

### EmployeeFilters
Filtres dynamiques :
- Sélection de département (depuis les stats)
- Filtre par statut
- Bouton de réinitialisation

### EmployeeStats
Statistiques en temps réel :
- Total employés
- Employés actifs/inactifs
- Nombre de départements

## 🚀 Utilisation

### Accès à la page
```
/employees
```

### Navigation depuis le dashboard
Un bouton "Employés" dans les actions rapides redirige vers `/employees`.

## ⚡ Performance

- **Cache React Query** : 2-5 minutes selon le type de données
- **Debounce** : 500ms pour éviter les requêtes excessives
- **Pagination** : Limite de 20 résultats par défaut (max 100)
- **Invalidation intelligente** : Cache invalidé seulement après mutations

## 🔒 Sécurité

- Route protégée avec `ProtectedRoute`
- Authentification JWT automatique via `axiosInstance`
- Redirection automatique vers `/login` si non authentifié

