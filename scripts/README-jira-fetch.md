# Script de récupération des équipements depuis Jira

Ce script permet de récupérer les équipements depuis Jira Asset de manière autonome.

## Prérequis

1. Node.js installé (version 14 ou supérieure)
2. Variables d'environnement configurées pour Jira

## Configuration

Créez un fichier `.env` dans le répertoire du script ou définissez les variables d'environnement :

```bash
# Configuration Jira Asset
JIRA_BASE_URL_ASSETS=https://votre-instance.atlassian.net
JIRA_BASE_PATH_ASSETS=/rest/servicedeskapi/assets/workspace/VOTRE_WORKSPACE_ID
JIRA_EMAIL_ASSETS=votre-email@exemple.com
JIRA_TOKEN_ASSETS=votre-token-api

# Ou utilisez les variables classiques Jira (si JIRA_BASE_PATH_ASSETS n'est pas défini)
JIRA_BASE_URL=https://votre-instance.atlassian.net
JIRA_EMAIL=votre-email@exemple.com
JIRA_API_TOKEN=votre-token-api
```

### Obtenir un token API Jira

1. Connectez-vous à votre instance Jira
2. Allez dans **Account Settings** > **Security** > **API tokens**
3. Créez un nouveau token
4. Copiez le token et utilisez-le dans la configuration

## Utilisation

### Récupérer tous les Laptops du schéma "Parc Informatique"

```bash
node scripts/fetch-jira-equipment.js
```

### Spécifier un schéma et un type d'objet

```bash
node scripts/fetch-jira-equipment.js --schema "Parc Informatique" --object-type "Laptop"
```

### Limiter le nombre de résultats

```bash
node scripts/fetch-jira-equipment.js --limit 50
```

### Rechercher des équipements

```bash
node scripts/fetch-jira-equipment.js --search "Dell"
```

### Sauvegarder dans un fichier JSON

```bash
node scripts/fetch-jira-equipment.js --output equipment.json
```

### Exporter en CSV

```bash
node scripts/fetch-jira-equipment.js --format csv --output equipment.csv
```

### Format table simple

```bash
node scripts/fetch-jira-equipment.js --format table
```

## Options disponibles

- `--schema <name>` : Nom du schéma (défaut: "Parc Informatique")
- `--object-type <name>` : Type d'objet (défaut: "Laptop")
- `--search <query>` : Recherche textuelle
- `--limit <number>` : Limite de résultats (défaut: 100)
- `--output <file>` : Fichier de sortie (optionnel)
- `--format <format>` : Format de sortie: json, csv, table (défaut: json)
- `--workspace-id <id>` : ID du workspace Jira (optionnel, sera récupéré automatiquement)

## Exemples d'utilisation

### Récupérer tous les équipements et sauvegarder en JSON

```bash
node scripts/fetch-jira-equipment.js --limit 1000 --output all-equipment.json
```

### Rechercher des équipements Dell et exporter en CSV

```bash
node scripts/fetch-jira-equipment.js --search "Dell" --format csv --output dell-equipment.csv
```

### Récupérer les PC fixes

```bash
node scripts/fetch-jira-equipment.js --object-type "PC Fixe" --limit 500
```

## Format de sortie JSON

Le script retourne un tableau d'objets Jira Asset avec la structure suivante :

```json
[
  {
    "id": "12345",
    "objectKey": "LAP-001",
    "objectTypeId": "67890",
    "attributes": [
      {
        "objectTypeAttributeId": "attr-1",
        "objectAttributeValues": [
          {
            "value": "SN123456789",
            "referencedObject": null,
            "status": null
          }
        ]
      }
    ]
  }
]
```

## Dépannage

### Erreur: Configuration manquante

Vérifiez que toutes les variables d'environnement sont définies :
- `JIRA_BASE_URL_ASSETS` ou `JIRA_BASE_URL`
- `JIRA_EMAIL_ASSETS` ou `JIRA_EMAIL`
- `JIRA_TOKEN_ASSETS` ou `JIRA_API_TOKEN`

### Erreur: Workspace non trouvé

Le script essaie automatiquement de récupérer le workspace ID. Si cela échoue :
1. Vérifiez que `JIRA_BASE_PATH_ASSETS` contient le workspace ID
2. Ou utilisez `--workspace-id` pour le spécifier manuellement

### Erreur: Aucun équipement trouvé

1. Vérifiez que le schéma et le type d'objet existent dans Jira
2. Vérifiez les permissions de votre compte Jira
3. Essayez avec `--limit 10` pour tester

## Notes

- Le script utilise l'API AQL (Asset Query Language) de Jira Asset
- La pagination est gérée automatiquement
- Les résultats sont limités par défaut à 100 pour éviter les requêtes trop longues
- Pour récupérer tous les équipements, utilisez `--limit 10000` (ou plus)

