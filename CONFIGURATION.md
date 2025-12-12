# Configuration de l'application

## Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec la variable suivante :

```env
# URL de l'API backend
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Note** : Le fichier `.env.local` est ignoré par git pour des raisons de sécurité. Ne le commitez jamais.

## Configuration Azure AD

⚠️ **IMPORTANT** : Toute la configuration Azure AD est gérée par le **backend**. Le frontend n'a pas besoin de connaître les identifiants Azure AD.

La configuration Azure AD doit être faite dans le backend (fichier `.env` du backend) :
- `AZURE_AD_CLIENT_ID`
- `AZURE_AD_CLIENT_SECRET`
- `AZURE_AD_TENANT_ID`
- `AZURE_AD_REDIRECT_URI`

Le backend doit être configuré pour rediriger vers le frontend après authentification. Voir `BACKEND_MODIFICATION_SUGGESTION.md` pour les modifications nécessaires.

## Démarrage

1. Installez les dépendances :
```bash
pnpm install
```

2. Configurez les variables d'environnement dans `.env.local`

3. Démarrez le serveur de développement :
```bash
pnpm dev
```

4. L'application sera accessible sur `http://localhost:3001`

## Architecture

- **`app/api/axiosInstance.ts`** : Instance axios centralisée avec intercepteurs pour gérer les tokens
- **`app/services/auth.service.ts`** : Service d'authentification pour communiquer avec le backend
- **`app/contexts/AuthContext.tsx`** : Contexte React pour gérer l'état d'authentification
- **`app/login/page.tsx`** : Page de connexion (redirige vers le backend)
- **`app/callback/page.tsx`** : Page de callback pour récupérer le token après authentification
- **`app/components/ProtectedRoute.tsx`** : Composant pour protéger les routes

## Flux d'authentification

1. L'utilisateur clique sur "Se connecter" sur `/login`
2. Le frontend redirige vers `http://localhost:3000/auth/azure-ad` (backend)
3. Le backend redirige vers Azure AD pour l'authentification
4. Après authentification, Azure AD redirige vers le backend `/auth/azure-ad/callback`
5. Le backend doit rediriger vers le frontend `/callback?token=...` (voir `BACKEND_MODIFICATION_SUGGESTION.md`)
6. Le frontend récupère le token, le stocke et redirige vers `/`

## Utilisation

### Utiliser l'instance axios

```typescript
import axiosInstance from '@/app/api/axiosInstance';

// Faire une requête authentifiée
const response = await axiosInstance.get('/api/endpoint');
```

### Utiliser le contexte d'authentification

```typescript
'use client';

import { useAuth } from '@/app/contexts/AuthContext';

export default function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // ...
}
```

### Protéger une route

```typescript
import { ProtectedRoute } from '@/app/components/ProtectedRoute';

export default function ProtectedPage() {
  return (
    <ProtectedRoute>
      <div>Contenu protégé</div>
    </ProtectedRoute>
  );
}
```

