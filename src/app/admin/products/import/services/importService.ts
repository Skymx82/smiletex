import * as XLSX from 'xlsx';
import { 
  createProduct, 
  createVariant, 
  addImageFromUrl,
  ProductData,
  VariantData
} from '../api/importApi';

// Types
export interface ImportConfig {
  replaceExisting: boolean;
  defaultCategory: string;
}

export interface ImportProgress {
  current: number;
  total: number;
  status: string;
  errors: string[];
}

export interface ProductGroup {
  parentId: string;
  rows: any[];
}

// Fonction pour analyser le fichier Excel
export const parseExcelFile = async (file: File): Promise<{
  headers: string[];
  rows: any[];
  productGroups: { [key: string]: any[] };
  totalProducts: number;
  totalVariants: number;
}> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  if (jsonData.length === 0) {
    throw new Error('Le fichier ne contient aucune donnée');
  }

  // Regrouper par produit parent
  const productGroups: { [key: string]: any[] } = {};
  jsonData.forEach((row: any) => {
    const parentProductId = row['Produit parent'];
    if (!parentProductId) {
      return;
    }
    
    if (!productGroups[parentProductId]) {
      productGroups[parentProductId] = [];
    }
    productGroups[parentProductId].push(row);
  });

  // Calculer les statistiques
  const totalProducts = Object.keys(productGroups).length;
  const totalVariants = jsonData.length;

  return {
    headers: jsonData.length > 0 ? Object.keys(jsonData[0] as object) : [],
    rows: jsonData.slice(0, 5), // Afficher les 5 premières lignes pour l'aperçu
    productGroups,
    totalProducts,
    totalVariants,
  };
};

// Fonction pour télécharger une image à partir d'une URL
export const downloadImageFromUrl = async (url: string): Promise<Blob | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    return await response.blob();
  } catch (error) {
    console.error(`Erreur lors du téléchargement de l'image ${url}:`, error);
    return null;
  }
};

// Fonction pour extraire le nom de fichier d'une URL
export const getFileNameFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    return pathParts[pathParts.length - 1] || `image-${Date.now()}.jpg`;
  } catch {
    return `image-${Date.now()}.jpg`;
  }
};

// Interface pour le mappage des catégories
export interface CategoryMapping {
  [parentProductId: string]: string; // Mapping produit parent -> ID catégorie
}

// Interface pour le mappage des colonnes
export interface ColumnMapping {
  sku: string;
  productName: string;
  colorCode: string;
  colorUrl: string;
  price: string;
  parentProduct: string;
  mainImage: string;
  modelImageA: string;
  modelImageB: string;
  modelImageC: string;
  description: string;
  weightGsm: string;
  supplierReference: string;
  material: string;
  isFeatured: string;
  isNew: string;
  [key: string]: string; // Pour d'autres colonnes à ajouter plus tard
}

// Fonction principale pour importer les produits
export const importProducts = async (
  productGroups: { [key: string]: any[] },
  config: ImportConfig,
  categoryMapping: CategoryMapping,
  columnMapping: ColumnMapping,
  onProgress: (progress: ImportProgress) => void
): Promise<ImportProgress> => {
  console.log('==== DÉBUT DE L\'IMPORTATION AVEC API MISE À JOUR ====');
  console.log('Nombre de groupes de produits:', Object.keys(productGroups).length);
  console.log('Mappage des colonnes:', columnMapping);
  console.log('Configuration d\'importation:', config);

  // Garder une trace des produits pour lesquels une image principale a déjà été ajoutée
  const productsWithPrimaryImage = new Set<string>();
  
  // Garder une trace des couleurs déjà traitées pour chaque produit
  const processedProductColors = new Map<string, Map<string, string>>();

  const progress: ImportProgress = {
    current: 0,
    total: Object.keys(productGroups).length,
    status: 'Préparation de l\'importation...',
    errors: [],
  };

  onProgress(progress);

  try {
    // Traiter chaque groupe de produits (un produit parent avec ses variantes)
    for (const parentProductId of Object.keys(productGroups)) {
      progress.current += 1;
      progress.status = `Importation du produit ${progress.current}/${progress.total}: ${parentProductId}`;
      onProgress(progress);

      const rows = productGroups[parentProductId];
      const firstRow = rows[0]; // Utiliser la première ligne pour les informations du produit principal

      try {
        // Déterminer la catégorie du produit (mapping spécifique ou catégorie par défaut)
        const categoryId = categoryMapping[parentProductId] || config.defaultCategory;
        
        // Utiliser les colonnes mappées pour extraire les données
        const productName = firstRow[columnMapping.productName] || '';
        const price = firstRow[columnMapping.price] ? parseFloat(firstRow[columnMapping.price]) : 0;
        const description = firstRow[columnMapping.description] || 'Produit importé automatiquement';
        
        // Traiter le grammage (convertir en nombre si nécessaire)
        let weightGsm = null;
        if (columnMapping.weightGsm && firstRow[columnMapping.weightGsm]) {
          const weightValue = firstRow[columnMapping.weightGsm];
          if (typeof weightValue === 'number') {
            weightGsm = weightValue;
          } else if (typeof weightValue === 'string') {
            // Essayer de convertir en nombre
            const parsedWeight = parseFloat(weightValue.replace(/[^0-9.,]/g, '').replace(',', '.'));
            if (!isNaN(parsedWeight)) {
              weightGsm = parsedWeight;
            }
          }
        }
        
        // Référence fournisseur et matière
        const supplierReference = firstRow[columnMapping.supplierReference] || parentProductId;
        const material = firstRow[columnMapping.material] || '';
        
        // Flags is_featured et is_new
        const isFeatured = firstRow[columnMapping.isFeatured] ? 
          ['oui', 'yes', 'true', '1'].includes(String(firstRow[columnMapping.isFeatured]).toLowerCase()) : false;
        
        const isNew = firstRow[columnMapping.isNew] ? 
          ['oui', 'yes', 'true', '1'].includes(String(firstRow[columnMapping.isNew]).toLowerCase()) : false;
        
        // Récupérer l'URL de l'image principale pour le produit
        const mainImageUrl = firstRow[columnMapping.mainImage] || '';
        
        // Créer le produit principal avec l'image_url
        const productData: ProductData = {
          name: productName,
          description: description,
          base_price: price,
          weight_gsm: weightGsm,
          supplier_reference: supplierReference,
          material: material,
          is_featured: isFeatured,
          is_new: isNew,
          category_id: categoryId,
          image_url: mainImageUrl // Ajouter l'URL de l'image principale
        };

        // Ajouter le produit à la base de données
        const productResult = await createProduct(productData);
        
        if (!productResult.success || !productResult.product) {
          throw new Error(productResult.error || 'Erreur lors de la création du produit');
        }
        
        const newProduct = productResult.product;

        // Regrouper les lignes par couleur (code ou URL)
        const colorGroups = new Map<string, any[]>();
        
        for (const row of rows) {
          const colorCode = row[columnMapping.colorCode] || '';
          const colorUrl = row[columnMapping.colorUrl] || '';
          
          // Créer une clé unique pour cette couleur
          const colorKey = colorUrl || colorCode || 'default';
          
          if (!colorGroups.has(colorKey)) {
            colorGroups.set(colorKey, []);
          }
          
          colorGroups.get(colorKey)?.push(row);
        }
        
        // Initialiser le suivi des couleurs pour ce produit s'il n'existe pas encore
        if (!processedProductColors.has(newProduct.id)) {
          processedProductColors.set(newProduct.id, new Map<string, string>());
        }
        const productColorMap = processedProductColors.get(newProduct.id)!;
        
        // Traiter chaque groupe de couleur
        for (const [colorKey, colorRows] of colorGroups.entries()) {
          try {
            // Utiliser la première ligne pour les informations de base de la variante
            const firstColorRow = colorRows[0];
            const colorCode = firstColorRow[columnMapping.colorCode] || '';
            const colorUrl = firstColorRow[columnMapping.colorUrl] || '';
            const sku = firstColorRow[columnMapping.sku] || '';
            
            // Utiliser le code couleur tel quel, sans conversion
            // On utilise une valeur par défaut si aucun code couleur n'est fourni
            const hexColorCode = colorCode || '#CCCCCC';
            
            // Vérifier si cette couleur a déjà été traitée pour ce produit
            if (productColorMap.has(colorKey)) {
              console.log(`La couleur ${colorKey} a déjà été traitée pour ce produit, on passe à la suivante`);
              continue;
            }
            
            // Extraire toutes les tailles uniques pour cette couleur
            const sizes = new Set<string>();
            for (const row of colorRows) {
              // Récupérer la taille depuis la colonne mappée
              const size = columnMapping.size ? row[columnMapping.size] || 'Unique' : 'Unique';
              sizes.add(size);
            }
            
            // Créer une variante pour chaque taille de cette couleur
            for (const size of sizes) {
              // Utiliser le SKU du fichier Excel s'il existe, sinon en générer un
              let variantSku = sku;
              
              // Si aucun SKU n'est fourni dans le fichier Excel, en générer un
              if (!variantSku) {
                const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                variantSku = `${newProduct.id.substring(0, 6)}-${colorKey.substring(0, 3)}-${size}-${Date.now().toString(36)}-${randomSuffix}`;
              } else {
                // Si on a un SKU de base, ajouter la taille pour le rendre unique par variante
                variantSku = `${variantSku}-${size}`;
              }
              
              // Créer une variante
              const variantData: VariantData = {
                product_id: newProduct.id,
                size: size,
                color: colorUrl ? null : hexColorCode, // Si colorUrl est défini, on laisse color à null
                color_url: colorUrl, // Nouveau champ pour stocker l'URL de l'image de couleur
                stock_quantity: 10, // Valeur par défaut
                price_adjustment: 0,
                sku: variantSku
              };

              // Ajouter la variante à la base de données
              const variantResult = await createVariant(variantData);
              
              if (!variantResult.success || !variantResult.variant) {
                throw new Error(variantResult.error || 'Erreur lors de la création de la variante');
              }
              
              // Stocker l'ID de la première variante créée pour cette couleur (pour les images)
              if (!productColorMap.has(colorKey)) {
                productColorMap.set(colorKey, variantResult.variant.id);
              }
            }
            
            // Récupérer l'ID de la première variante créée pour cette couleur (pour les images)
            const variantId = productColorMap.get(colorKey)!;
            
            // Récupérer les URLs des images depuis la première ligne de cette couleur
            const mainImage = firstColorRow[columnMapping.mainImage];
            const modelImageA = firstColorRow[columnMapping.modelImageA];
            const modelImageB = firstColorRow[columnMapping.modelImageB];
            const modelImageC = firstColorRow[columnMapping.modelImageC];
            
            // Traiter les images si elles existent (une seule fois par couleur)
            if (mainImage || modelImageA || modelImageB || modelImageC) {
              // Image principale (is_primary = true seulement pour la première couleur du produit)
              if (mainImage) {
                try {
                  // Vérifier si une image principale existe déjà pour ce produit
                  const isPrimary = !productsWithPrimaryImage.has(newProduct.id);
                  
                  const mainImageResult = await addImageFromUrl(
                    mainImage, 
                    newProduct.id, 
                    variantId, 
                    isPrimary // is_primary = true seulement pour la première variante
                  );
                  
                  if (!mainImageResult.success) {
                    console.warn(`Erreur lors de l'ajout de l'image: ${mainImageResult.error}`);
                  } else {
                    if (isPrimary) {
                      // Marquer ce produit comme ayant déjà une image principale
                      productsWithPrimaryImage.add(newProduct.id);
                      console.log(`Image principale ajoutée pour le produit: ${mainImage}`);
                    } else {
                      console.log(`Image standard ajoutée pour la couleur ${colorKey}: ${mainImage}`);
                    }
                  }
                } catch (imgError: any) {
                  console.error(`Erreur lors de l'ajout de l'image: ${imgError?.message || 'Erreur inconnue'}`);
                }
              }
              
              // Images portées (is_primary = false)
              const modelImages = [modelImageA, modelImageB, modelImageC].filter(Boolean);
              for (const modelImage of modelImages) {
                try {
                  const modelImageResult = await addImageFromUrl(
                    modelImage, 
                    newProduct.id, 
                    variantId, 
                    false // is_primary = false
                  );
                  
                  if (!modelImageResult.success) {
                    console.warn(`Erreur lors de l'ajout de l'image portée: ${modelImageResult.error}`);
                  } else {
                    console.log(`Image portée ajoutée pour la couleur ${colorKey}: ${modelImage}`);
                  }
                } catch (imgError: any) {
                  console.error(`Erreur lors de l'ajout de l'image portée: ${imgError?.message || 'Erreur inconnue'}`);
                }
              }
            }
          } catch (error) {
            const errorMessage = `Erreur lors de l'importation des variantes de couleur ${colorKey} pour le produit ${parentProductId}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
            console.error(errorMessage);
            progress.errors.push(errorMessage);
            onProgress(progress);
          }
        }
      } catch (error) {
        const errorMessage = `Erreur lors de l'importation du produit ${parentProductId}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
        console.error(errorMessage);
        progress.errors.push(errorMessage);
        onProgress(progress);
      }
    }

    progress.status = progress.errors.length > 0
      ? `Importation terminée avec ${progress.errors.length} erreurs`
      : 'Importation terminée avec succès!';
  } catch (error) {
    const errorMessage = `Erreur globale lors de l'importation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
    console.error(errorMessage);
    progress.errors.push(errorMessage);
    progress.status = 'Échec de l\'importation';
  }

  onProgress(progress);
  return progress;
};
