#!/usr/bin/env node

/**
 * Script pour obtenir le token depuis le navigateur
 * 
 * Ce script ouvre une page HTML qui affiche le token stocké dans localStorage
 * 
 * Usage:
 *   node scripts/get-token-from-browser.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8888;
const HTML_PAGE = `
<!DOCTYPE html>
<html>
<head>
    <title>Récupérer le token JWT</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
        }
        .token-box {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
            word-break: break-all;
            font-family: monospace;
            font-size: 12px;
        }
        .button {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin: 5px;
        }
        .button:hover {
            background: #0056b3;
        }
        .success {
            color: #28a745;
            font-weight: bold;
        }
        .error {
            color: #dc3545;
        }
        .instructions {
            background: #e7f3ff;
            border-left: 4px solid #007bff;
            padding: 15px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔑 Récupérer le token JWT</h1>
        
        <div class="instructions">
            <h3>Instructions:</h3>
            <ol>
                <li>Assurez-vous d'être connecté sur <a href="http://localhost:3001" target="_blank">http://localhost:3001</a></li>
                <li>Cliquez sur le bouton ci-dessous pour récupérer votre token</li>
                <li>Copiez le token et utilisez-le avec le script fetch-jira-equipment-backend.js</li>
            </ol>
        </div>

        <button class="button" onclick="getToken()">Récupérer le token</button>
        <button class="button" onclick="copyToken()">Copier le token</button>

        <div id="token-display"></div>
    </div>

    <script>
        function getToken() {
            const token = localStorage.getItem('access_token');
            const azureToken = localStorage.getItem('azure_access_token');
            const display = document.getElementById('token-display');
            
            if (token) {
                display.innerHTML = \`
                    <h3 class="success">✅ Token JWT trouvé!</h3>
                    <div class="token-box" id="token-box">
                        <strong>Access Token:</strong><br>
                        \${token}<br><br>
                        \${azureToken ? '<strong>Azure Token:</strong><br>' + azureToken : ''}
                    </div>
                    <p><strong>Pour utiliser le script:</strong></p>
                    <code>node scripts/fetch-jira-equipment-backend.js --token "\${token}"</code>
                \`;
            } else {
                display.innerHTML = \`
                    <h3 class="error">❌ Aucun token trouvé</h3>
                    <p>Veuillez vous connecter sur <a href="http://localhost:3001" target="_blank">http://localhost:3001</a> d'abord.</p>
                \`;
            }
        }

        function copyToken() {
            const token = localStorage.getItem('access_token');
            if (token) {
                navigator.clipboard.writeText(token).then(() => {
                    alert('Token copié dans le presse-papier!');
                });
            } else {
                alert('Aucun token trouvé. Cliquez d\'abord sur "Récupérer le token"');
            }
        }

        // Essayer de récupérer automatiquement au chargement
        window.onload = function() {
            getToken();
        };
    </script>
</body>
</html>
`;

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(HTML_PAGE);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`\n🌐 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`\n📋 Instructions:`);
  console.log(`   1. Ouvrez votre navigateur sur http://localhost:${PORT}`);
  console.log(`   2. Assurez-vous d'être connecté sur http://localhost:3001`);
  console.log(`   3. Cliquez sur "Récupérer le token"`);
  console.log(`   4. Copiez le token et utilisez-le avec le script\n`);
  
  // Ouvrir automatiquement le navigateur
  const url = `http://localhost:${PORT}`;
  const platform = process.platform;
  let command;
  
  if (platform === 'win32') {
    command = `start ${url}`;
  } else if (platform === 'darwin') {
    command = `open ${url}`;
  } else {
    command = `xdg-open ${url}`;
  }
  
  exec(command, (error) => {
    if (error) {
      console.log(`   Ouvrez manuellement: ${url}\n`);
    }
  });
  
  console.log('   Appuyez sur Ctrl+C pour arrêter le serveur\n');
});

