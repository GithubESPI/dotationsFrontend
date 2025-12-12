'use client';

import { useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-between py-16 px-8 bg-white dark:bg-zinc-900 sm:items-start">
          <div className="w-full">
            <div className="mb-8 flex items-center justify-between">
              <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
                Bienvenue
              </h1>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Déconnexion
              </button>
            </div>

            {isLoading ? (
              <div className="text-center">
                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
                <div className="text-lg text-zinc-600 dark:text-zinc-400">Chargement...</div>
              </div>
            ) : user ? (
              <div className="rounded-lg bg-zinc-100 p-6 dark:bg-zinc-800">
                <h2 className="mb-4 text-xl font-semibold text-black dark:text-zinc-50">
                  Informations utilisateur
                </h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      Nom:
                    </span>
                    <p className="text-lg text-black dark:text-zinc-50">{user.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      Email:
                    </span>
                    <p className="text-lg text-black dark:text-zinc-50">{user.email}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      ID:
                    </span>
                    <p className="text-sm text-black dark:text-zinc-50">{user.id}</p>
                  </div>
                  {user.roles && user.roles.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        Rôles:
                      </span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {user.roles.map((role, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {user.graphData && (
                  <div className="mt-6 rounded-lg bg-zinc-200 p-4 dark:bg-zinc-700">
                    <h3 className="mb-2 text-sm font-semibold text-black dark:text-zinc-50">
                      Données Microsoft Graph
                    </h3>
                    <pre className="overflow-auto text-xs text-zinc-700 dark:text-zinc-300">
                      {JSON.stringify(user.graphData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-zinc-600 dark:text-zinc-400">
                Aucune information utilisateur disponible
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
