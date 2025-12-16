'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Temps de cache par défaut : 5 minutes
            staleTime: 1000 * 60 * 5,
            // Temps de cache en mémoire : 10 minutes
            gcTime: 1000 * 60 * 10,
            // Réessayer automatiquement en cas d'erreur
            retry: 1,
            // Référencer les données lors de la perte de focus
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

