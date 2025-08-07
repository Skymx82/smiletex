const xlsx = require('xlsx');
const path = require('path');

// Chemin vers le fichier Excel
const filePath = path.join(__dirname, '../public/Imbretex.xlsx');

// Lire le fichier Excel
try {
  const workbook = xlsx.readFile(filePath);
  
  // Obtenir le nom de la première feuille
  const sheetName = workbook.SheetNames[0];
  
  // Obtenir la première feuille
  const worksheet = workbook.Sheets[sheetName];
  
  // Convertir la feuille en JSON
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Afficher les en-têtes (première ligne)
  console.log("Analyse des en-têtes du fichier Excel:");
  console.log("====================================");
  
  if (data.length > 0) {
    const headers = data[0];
    console.log("Nombre de colonnes:", headers.length);
    console.log("\nListe des en-têtes:");
    headers.forEach((header, index) => {
      console.log(`${index + 1}. ${header}`);
    });
    
    // Afficher quelques exemples de données (2ème ligne si elle existe)
    if (data.length > 1) {
      console.log("\nExemple de données (première ligne):");
      const firstRow = data[1];
      headers.forEach((header, index) => {
        if (index < firstRow.length) {
          console.log(`${header}: ${firstRow[index]}`);
        }
      });
    }
  } else {
    console.log("Le fichier Excel est vide ou ne contient pas d'en-têtes.");
  }
} catch (error) {
  console.error("Erreur lors de la lecture du fichier Excel:", error);
}
