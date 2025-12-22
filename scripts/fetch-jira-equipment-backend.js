#!/usr/bin/env node

/**
 * Script pour récupérer les équipements depuis Jira via l'API backend
 * 
 * Ce script utilise l'API backend qui gère déjà la configuration Jira.
 * Plus simple à utiliser car pas besoin de configurer les credentials Jira.
 * 
 * Usage:
 *   node scripts/fetch-jira-equipment-backend.js [options]
 * 
 * Options:
 *   --schema <name>          Nom du schéma (défaut: "Parc Informatique")
 *   --object-type <name>    Type d'objet (défaut: "Laptop")
 *   --limit <number>        Limite de résultats (défaut: 100)
 *   --output <file>         Fichier de sortie JSON (optionnel)
 *   --format <format>       Format de sortie: json, csv, table (défaut: json)
 *   --api-url <url>         URL de l'API backend (défaut: http://localhost:3000)
 *   --token <token>         Token JWT pour l'authentification (optionnel)
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3000';

// Parser les arguments de ligne de commande
const args = process.argv.slice(2);
const options = {
  schema: 'Parc Informatique',
  objectType: 'Laptop',
  limit: 100,
  output: null,
  format: 'json',
  apiUrl: API_URL,
  token: process.env.ACCESS_TOKEN || null,
};

for (let i = 0; i < args.length; i += 2) {
  const key = args[i]?.replace('--', '');
  const value = args[i + 1];
  
  if (key === 'schema') options.schema = value;
  else if (key === 'object-type') options.objectType = value;
  else if (key === 'limit') options.limit = parseInt(value, 10);
  else if (key === 'output') options.output = value;
  else if (key === 'format') options.format = value;
  else if (key === 'api-url') options.apiUrl = value;
  else if (key === 'token') options.token = value;
}

/**
 * Effectuer une requête HTTP/HTTPS
 */
function makeRequest(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    };

    // Ajouter le token d'authentification si disponible
    if (options.token) {
      requestOptions.headers['Authorization'] = `Bearer ${options.token}`;
    }

    const req = client.request(requestOptions, (res) => {
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
 * Récupérer les équipements depuis le backend
 */
async function fetchEquipmentFromBackend() {
  try {
    console.log(`🔍 Récupération des équipements depuis le backend...`);
    console.log(`   API: ${options.apiUrl}`);
    console.log(`   Schéma: ${options.schema}`);
    console.log(`   Type d'objet: ${options.objectType}\n`);

    const url = `${options.apiUrl}/jira-asset/schema/${encodeURIComponent(options.schema)}/object-type/${encodeURIComponent(options.objectType)}`;
    
    const response = await makeRequest(url);
    
    if (response.assets && Array.isArray(response.assets)) {
      return response.assets.slice(0, options.limit);
    }
    
    return [];
  } catch (error) {
    if (error.message.includes('401') || error.message.includes('403')) {
      console.error('❌ Erreur d\'authentification');
      console.error('   Le backend nécessite une authentification.');
      console.error('   Utilisez --token <votre-token-jwt> ou définissez ACCESS_TOKEN dans les variables d\'environnement');
      console.error('\n   Pour obtenir un token, connectez-vous via le frontend et récupérez-le depuis localStorage');
    } else {
      console.error(`❌ Erreur: ${error.message}`);
    }
    throw error;
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
    console.log('🚀 Démarrage de la récupération des équipements depuis Jira via le backend...\n');
    
    // Vérifier que le backend est accessible
    try {
      await makeRequest(`${options.apiUrl}/health`).catch(() => {
        // Ignorer les erreurs de health check
      });
    } catch (error) {
      console.warn(`⚠️  Impossible de vérifier la santé du backend à ${options.apiUrl}`);
      console.warn('   Assurez-vous que le backend est démarré et accessible\n');
    }

    // Récupérer les assets
    const assets = await fetchEquipmentFromBackend();

    if (assets.length === 0) {
      console.log('⚠️  Aucun équipement trouvé');
      return;
    }

    console.log(`✅ ${assets.length} équipement(s) récupéré(s)\n`);

    // Formater la sortie
    const output = formatOutput(assets, options.format);

    // Afficher ou sauvegarder
    if (options.output) {
      const outputPath = path.resolve(options.output);
      fs.writeFileSync(outputPath, output, 'utf8');
      console.log(`✅ Résultats sauvegardés dans: ${outputPath}`);
      console.log(`   Format: ${options.format}`);
      console.log(`   Nombre d'équipements: ${assets.length}`);
    } else {
      console.log('📋 Résultats:\n');
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

