# Modification suggérée pour le backend

Pour que l'authentification fonctionne correctement avec le frontend, il faut modifier le callback Azure AD dans le backend pour qu'il redirige vers le frontend avec le token.

## Modification à apporter dans `src/auth/auth.controller.ts`

Modifier la méthode `azureAdCallback` pour rediriger vers le frontend au lieu de retourner du HTML :

```typescript
@Get('azure-ad/callback')
@Public()
@UseGuards(AuthGuard('azure-ad'))
@ApiOperation({ summary: 'Callback Azure AD après authentification avec Microsoft Graph' })
async azureAdCallback(@Request() req, @Res() res) {
  // Passer l'access token Azure AD pour récupérer les données depuis Graph
  const azureAccessToken = req.user?.accessToken;
  const result = await this.authService.login(req.user, azureAccessToken);
  
  // Rediriger vers le frontend avec le token
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  const redirectUrl = `${frontendUrl}/callback?token=${encodeURIComponent(result.access_token)}`;
  
  return res.redirect(redirectUrl);
}
```

**Important** : Ajouter `@Res() res` dans les imports de `@nestjs/common` si ce n'est pas déjà fait.

## Alternative : Utiliser un fragment d'URL (plus sécurisé)

Pour plus de sécurité, vous pouvez utiliser un fragment d'URL au lieu d'un paramètre de requête :

```typescript
const redirectUrl = `${frontendUrl}/callback#token=${encodeURIComponent(result.access_token)}`;
```

Dans ce cas, modifiez aussi `app/callback/page.tsx` pour lire depuis `window.location.hash` au lieu de `searchParams`.

## Configuration

Assurez-vous que la variable d'environnement `FRONTEND_URL` est configurée dans le backend :

```env
FRONTEND_URL=http://localhost:3001
```

