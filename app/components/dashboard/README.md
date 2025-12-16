# Composants Dashboard

Ce dossier contient les composants réutilisables pour le dashboard.

## Composants disponibles

### StatCard
Carte de statistique avec effet MagicContainer et tendances.

```tsx
import StatCard from '@/app/components/dashboard/StatCard';

<StatCard
  title="Total Dotations"
  value="24"
  icon={<YourIcon />}
  trend={{ value: 12, label: 'vs mois dernier', isPositive: true }}
/>
```

### QuickActions
Grille d'actions rapides avec icônes et couleurs personnalisables.

```tsx
import QuickActions from '@/app/components/dashboard/QuickActions';

<QuickActions
  actions={[
    {
      label: 'Nouvelle Dotation',
      icon: <YourIcon />,
      onClick: () => handleAction(),
      color: 'from-green-500 to-emerald-500',
    },
  ]}
/>
```

### ActivityFeed
Flux d'activités récentes avec différents types (success, info, warning, error).

```tsx
import ActivityFeed from '@/app/components/dashboard/ActivityFeed';

<ActivityFeed
  activities={[
    {
      id: '1',
      title: 'Dotation approuvée',
      description: 'Votre demande a été approuvée',
      time: 'Il y a 2 heures',
      type: 'success',
    },
  ]}
/>
```

## Hooks React Query

### useUser
Récupère le profil utilisateur avec cache automatique.

```tsx
import { useUser } from '@/app/hooks/useUser';

const { data: user, isLoading, error } = useUser();
```

### useUserGroups
Récupère les groupes de l'utilisateur depuis Microsoft Graph.

```tsx
import { useUserGroups } from '@/app/hooks/useUser';

const { data: groups, isLoading } = useUserGroups();
```

### useUserPhoto
Récupère la photo de profil de l'utilisateur.

```tsx
import { useUserPhoto } from '@/app/hooks/useUser';

const { data: photo, isLoading } = useUserPhoto();
```

## Performance

- **Cache intelligent** : Les données sont mises en cache pendant 5-10 minutes
- **Refetch optimisé** : Pas de refetch automatique lors du focus de la fenêtre
- **Retry limité** : 1 seule tentative de retry en cas d'erreur
- **DevTools** : React Query DevTools disponible en développement

