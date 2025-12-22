#!/usr/bin/env node

/**
 * Script pour récupérer les équipements depuis Jira Asset
 * 
 * Usage:
 *   node scripts/fetch-jira-equipment.js [options]
 * 
 * Options:
 *   --schema <name>          Nom du schéma (défaut: "Parc Informatique")
 *   --object-type <name>    Type d'objet (défaut: "Laptop")
 *   --search <query>        Recherche textuelle
 *   --limit <number>        Limite de résultats (défaut: 100)
 *   --output <file>         Fichier de sortie JSON (optionnel)
 *   --format <format>       Format de sortie: json, csv, table (défaut: json)
 *   --workspace-id <id>     ID du workspace Jira (optionnel, sera récupéré automatiquement)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration depuis les variables d'environnement
const config = {
  baseUrl: process.env.JIRA_BASE_URL_ASSETS || process.env.JIRA_BASE_URL || '',
  basePath: process.env.JIRA_BASE_PATH_ASSETS || '',
  email: process.env.JIRA_EMAIL_ASSETS || process.env.JIRA_EMAIL || '',
  token: process.env.JIRA_TOKEN_ASSETS || process.env.JIRA_API_TOKEN || '',
};

// Parser les arguments de ligne de commande
const args = process.argv.slice(2);
const options = {
  schema: 'Parc Informatique',
  objectType: 'Laptop',
  search: null,
  limit: 100,
  output: null,
  format: 'json',
  workspaceId: null,
};

for (let i = 0; i < args.length; i += 2) {
  const key = args[i]?.replace('--', '');
  const value = args[i + 1];
  
  if (key === 'schema') options.schema = value;
  else if (key === 'object-type') options.objectType = value;
  else if (key === 'search') options.search = value;
  else if (key === 'limit') options.limit = parseInt(value, 10);
  else if (key === 'output') options.output = value;
  else if (key === 'format') options.format = value;
  else if (key === 'workspace-id') options.workspaceId = value;
}

// Vérifier la configuration
if (!config.baseUrl || !config.email || !config.token) {
  console.error('❌ Erreur: Configuration manquante');
  console.error('Variables d\'environnement requises:');
  console.error('  - JIRA_BASE_URL_ASSETS ou JIRA_BASE_URL');
  console.error('  - JIRA_EMAIL_ASSETS ou JIRA_EMAIL');
  console.error('  - JIRA_TOKEN_ASSETS ou JIRA_API_TOKEN');
  console.error('\nOu utilisez un fichier .env dans le répertoire du script');
  process.exit(1);
}

/**
 * Construire l'URL complète pour l'API Jira Assets
 */
function buildAssetsUrl(endpoint) {
  const baseUrl = config.baseUrl.replace(/\/$/, '');
  if (config.basePath) {
    const basePath = config.basePath.replace(/^\/+/, '').replace(/\/+$/, '');
    const endpointPath = endpoint.replace(/^\/+/, '');
    return `${baseUrl}/${basePath}/${endpointPath}`.replace(/\/+/g, '/').replace(/https:\//, 'https://');
  }
  return `${baseUrl}${endpoint}`;
}

/**
 * Effectuer une requête HTTPS
 */
function makeRequest(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const auth = Buffer.from(`${config.email}:${config.token.replace(/^["']|["']$/g, '')}`).toString('base64');
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(jsonData);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(jsonData)}`));
          }
        } catch (e) {
          reject(new Error(`Erreur de parsing JSON: ${e.message}\nRéponse: ${data.substring(0, 200)}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * Obtenir l'ID du workspace
 */
async function getWorkspaceId() {
  if (options.workspaceId) {
    return options.workspaceId;
  }

  try {
    // Essayer d'extraire depuis le basePath
    if (config.basePath) {
      const workspaceMatch = config.basePath.match(/workspace\/([a-f0-9-]+)/i);
      if (workspaceMatch && workspaceMatch[1]) {
        console.log(`✅ Workspace ID extrait du chemin: ${workspaceMatch[1]}`);
        return workspaceMatch[1];
      }
    }

    // Sinon, récupérer via l'API
    const workspaceUrl = config.basePath
      ? `${config.baseUrl.replace(/\/$/, '')}${config.basePath.replace(/^\/+/, '/')}/workspace`
      : `${config.baseUrl.replace(/\/$/, '')}/rest/servicedeskapi/assets/workspace`;

    console.log('🔍 Récupération du workspace ID...');
    const response = await makeRequest(workspaceUrl);
    
    if (response.values && response.values.length > 0) {
      const workspaceId = response.values[0].workspaceId;
      console.log(`✅ Workspace ID récupéré: ${workspaceId}`);
      return workspaceId;
    }

    throw new Error('Aucun workspace trouvé');
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération du workspace: ${error.message}`);
    throw error;
  }
}

/**
 * Récupérer tous les objets d'un type d'objet spécifique
 */
async function getAllAssetsByObjectType(schemaName, objectTypeName, limit = 1000) {
  const allAssets = [];
  let start = 0;
  const pageSize = 100;

  console.log(`🔍 Récupération des objets de type "${objectTypeName}" du schéma "${schemaName}"...`);

  const searchUrl = buildAssetsUrl('object/aql');

  while (true) {
    const aqlBody = {
      qlQuery: `objectSchema = "${schemaName}" AND objectType = "${objectTypeName}"`,
      start,
      limit: pageSize,
    };

    try {
      const response = await makeRequest(searchUrl, 'POST', aqlBody);
      const assets = response.values || [];
      const totalSize = response.size || 0;

      allAssets.push(...assets);

      const pageNum = Math.floor(start / pageSize) + 1;
      console.log(`📦 Page ${pageNum}: ${assets.length} objets récupérés (total: ${allAssets.length}${totalSize > 0 ? `/${totalSize}` : ''})`);

      // Vérifier s'il y a plus de résultats
      const hasMore = assets.length > 0 &&
        (totalSize === 0 || allAssets.length < totalSize) &&
        allAssets.length < limit;

      if (!hasMore) {
        break;
      }

      start += assets.length;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération: ${error.message}`);
      throw error;
    }
  }

  console.log(`✅ ${allAssets.length} objets récupérés`);
  return allAssets.slice(0, limit);
}

/**
 * Rechercher des assets
 */
async function searchAssets(objectTypeId, query, limit = 50) {
  const searchUrl = buildAssetsUrl('object/navlist/iql');
  
  try {
    const response = await makeRequest(searchUrl, 'POST', {
      objectTypeId,
      iql: query || '',
      resultPerPage: limit,
    });

    return response.values || [];
  } catch (error) {
    console.error(`❌ Erreur lors de la recherche: ${error.message}`);
    // Si l'API de recherche n'est pas disponible, retourner un tableau vide
    return [];
  }
}

/**
 * Extraire la valeur d'un attribut
 */
function getAttributeValue(asset, attributeId) {
  if (!attributeId) return undefined;
  
  const attr = asset.attributes.find(a => a.objectTypeAttributeId === attributeId);
  if (!attr || !attr.objectAttributeValues || attr.objectAttributeValues.length === 0) {
    return undefined;
  }

  const value = attr.objectAttributeValues[0];
  
  if (typeof value.value === 'string' || typeof value.value === 'number' || typeof value.value === 'boolean') {
    return String(value.value);
  }
  
  if (value.referencedObject) {
    return value.referencedObject.objectKey || value.referencedObject.id || undefined;
  }
  
  if (value.status) {
    return value.status.name || value.status.id || undefined;
  }
  
  return undefined;
}

/**
 * Formater les données pour l'affichage
 */
function formatOutput(assets, format) {
  if (format === 'csv') {
    // En-têtes CSV
    const headers = ['ID', 'Object Key', 'Serial Number', 'Brand', 'Model', 'Type', 'Status', 'Internal ID'];
    const rows = assets.map(asset => {
      // Essayer de détecter les attributs communs
      const serialNumber = asset.attributes.find(a => {
        const val = a.objectAttributeValues?.[0]?.value;
        return val && typeof val === 'string' && /^[A-Z0-9]{4,20}$/i.test(val);
      });
      const serial = serialNumber?.objectAttributeValues?.[0]?.value || '';

      return [
        asset.id,
        asset.objectKey || '',
        serial,
        '', // Brand
        '', // Model
        '', // Type
        '', // Status
        '', // Internal ID
      ].map(v => `"${v}"`).join(',');
    });

    return [headers.map(h => `"${h}"`).join(','), ...rows].join('\n');
  }

  if (format === 'table') {
    // Format table simple
    const lines = assets.map((asset, index) => {
      return `${index + 1}. ${asset.objectKey || asset.id}`;
    });
    return lines.join('\n');
  }

  // Format JSON par défaut
  return JSON.stringify(assets, null, 2);
}

/**
 * Fonction principale
 */
async function main() {
  try {
    console.log('🚀 Démarrage de la récupération des équipements depuis Jira...\n');
    console.log(`Configuration:`);
    console.log(`  - Schéma: ${options.schema}`);
    console.log(`  - Type d'objet: ${options.objectType}`);
    console.log(`  - Limite: ${options.limit}`);
    if (options.search) {
      console.log(`  - Recherche: ${options.search}`);
    }
    console.log('');

    // Récupérer les assets
    let assets;
    
    if (options.search && options.workspaceId) {
      // Recherche avec IQL (nécessite objectTypeId)
      console.log('⚠️  La recherche IQL nécessite un objectTypeId. Utilisation de la méthode par schéma...');
      assets = await getAllAssetsByObjectType(options.schema, options.objectType, options.limit);
      
      // Filtrer par recherche textuelle
      if (options.search) {
        const lowerQuery = options.search.toLowerCase();
        assets = assets.filter(asset => {
          const allValues = JSON.stringify(asset).toLowerCase();
          return allValues.includes(lowerQuery);
        });
        console.log(`🔍 ${assets.length} résultats après filtrage par "${options.search}"`);
      }
    } else {
      // Récupération par schéma et type d'objet
      assets = await getAllAssetsByObjectType(options.schema, options.objectType, options.limit);
    }

    if (assets.length === 0) {
      console.log('⚠️  Aucun équipement trouvé');
      return;
    }

    // Formater la sortie
    const output = formatOutput(assets, options.format);

    // Afficher ou sauvegarder
    if (options.output) {
      const outputPath = path.resolve(options.output);
      fs.writeFileSync(outputPath, output, 'utf8');
      console.log(`\n✅ Résultats sauvegardés dans: ${outputPath}`);
      console.log(`   Format: ${options.format}`);
      console.log(`   Nombre d'équipements: ${assets.length}`);
    } else {
      console.log('\n📋 Résultats:\n');
      console.log(output);
    }

    console.log(`\n✅ Terminé: ${assets.length} équipement(s) récupéré(s)`);
  } catch (error) {
    console.error(`\n❌ Erreur: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Exécuter le script
main();

