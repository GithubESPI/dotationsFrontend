# ✅ Configuration complète - Authentification Azure AD

## ✅ Modifications effectuées

### Frontend
- ✅ Suppression de MSAL (tout est géré par le backend)
- ✅ Instance axios centralisée avec intercepteurs
- ✅ Service d'authentification simplifié
- ✅ Page de login qui redirige vers le backend
- ✅ Page de callback pour récupérer le token
- ✅ Contexte d'authentification React

### Backend
- ✅ Modification du callback Azure AD pour rediriger vers le frontend avec le token

## Configuration requise

### Backend (.env)
Assurez-vous que votre fichier `.env` du backend contient :

```env
# Configuration Azure AD
AZURE_AD_CLIENT_ID=votre-client-id
AZURE_AD_CLIENT_SECRET=votre-client-secret
AZURE_AD_TENANT_ID=votre-tenant-id
AZURE_AD_REDIRECT_URI=http://localhost:3000/auth/azure-ad/callback

# URL du frontend (pour la redirection après authentification)
FRONTEND_URL=http://localhost:3001

# Port du backend
PORT=3000
```

### Frontend (.env.local)
Créez un fichier `.env.local` à la racine du projet frontend :

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Flux d'authentification

1. **Utilisateur clique sur "Se connecter"** → `/login`
2. **Frontend redirige** → `http://localhost:3000/auth/azure-ad`
3. **Backend redirige** → Azure AD (Microsoft login)
4. **Azure AD redirige** → `http://localhost:3000/auth/azure-ad/callback`
5. **Backend génère le token JWT** et redirige → `http://localhost:3001/callback?token=...`
6. **Frontend récupère le token**, le stocke et redirige → `/`

## Démarrage

### Backend
```bash
cd dotation-backend
npm run start:dev
# ou
pnpm dev
```

### Frontend
```bash
cd dotations
pnpm dev
```

## Test

1. Ouvrez `http://localhost:3001`
2. Cliquez sur "Se connecter avec Microsoft"
3. Connectez-vous avec votre compte Microsoft Azure
4. Vous serez redirigé vers la page d'accueil avec votre profil

## Utilisation de l'API

Tous les appels API utilisent automatiquement l'instance axios centralisée :

```typescript
import axiosInstance from '@/app/api/axiosInstance';

// Le token est automatiquement ajouté dans les headers
const response = await axiosInstance.get('/api/endpoint');
```

## Protection des routes

Utilisez le composant `ProtectedRoute` :

```typescript
import { ProtectedRoute } from '@/app/components/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>Contenu protégé</div>
    </ProtectedRoute>
  );
}
```

## Utilisation du contexte d'authentification

```typescript
'use client';

import { useAuth } from '@/app/contexts/AuthContext';

export default function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // ...
}
```

