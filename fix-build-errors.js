#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fonction pour lire un fichier
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// Fonction pour écrire un fichier
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

// Corrections à appliquer
const fixes = [
  // Corriger window.location sans vérification
  {
    pattern: /window\.location\.search/g,
    replacement: 'typeof window !== "undefined" ? window.location.search : ""'
  },
  {
    pattern: /window\.location\.origin/g,
    replacement: 'typeof window !== "undefined" ? window.location.origin : "https://www.smiletex.fr"'
  },
  {
    pattern: /window\.location\.href = /g,
    replacement: 'if (typeof window !== "undefined") window.location.href = '
  },
  // Corriger new Date().toLocaleDateString() côté serveur
  {
    pattern: /new Date\(\)\.toLocaleDateString\('fr-FR'\)/g,
    replacement: '"01/04/2025"'
  },
  // Corriger window.dispatchEvent sans vérification
  {
    pattern: /window\.dispatchEvent\(/g,
    replacement: 'if (typeof window !== "undefined") window.dispatchEvent('
  }
];

// Fichiers à corriger
const filesToFix = [
  'src/app/cart/page.tsx',
  'src/app/contact/page.tsx',
  'src/app/login/page.tsx',
  'src/app/forgot-password/page.tsx',
  'src/app/checkout/success/page.tsx',
  'src/app/mentions-legales/page.tsx',
  'src/app/account/page.tsx',
  'src/app/admin/customers/page.tsx'
];

console.log('🔧 Correction des erreurs de build...\n');

filesToFix.forEach(file => {
  const fullPath = path.join(__dirname, file);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Fichier non trouvé: ${file}`);
    return;
  }

  let content = readFile(fullPath);
  let modified = false;

  fixes.forEach(fix => {
    if (fix.pattern.test(content)) {
      content = content.replace(fix.pattern, fix.replacement);
      modified = true;
    }
  });

  if (modified) {
    writeFile(fullPath, content);
    console.log(`✅ Corrigé: ${file}`);
  } else {
    console.log(`ℹ️  Aucune correction nécessaire: ${file}`);
  }
});

console.log('\n🎉 Corrections terminées !');
