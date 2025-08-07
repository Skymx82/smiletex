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
export const parseExcelFile = async (file: File, columnMapping?: { parentProduct: string }): Promise<{
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

  console.log('Données brutes du fichier Excel (2 premiers éléments):', JSON.stringify(jsonData.slice(0, 2), null, 2));
  console.log('Nombre total de lignes dans le fichier Excel:', jsonData.length);
  
  if (jsonData.length > 0) {
    console.log('Colonnes disponibles dans le fichier:', Object.keys(jsonData[0] as object));
  }

  // Déterminer la colonne à utiliser pour le regroupement des produits
  const parentProductColumn = columnMapping?.parentProduct || 'Produit parent';
  console.log(`Utilisation de la colonne "${parentProductColumn}" pour regrouper les produits`);

  // Regrouper par produit parent
  const productGroups: { [key: string]: any[] } = {};
  let rowsWithoutParent: any[] = [];
  
  jsonData.forEach((row: any) => {
    const parentProductId = row[parentProductColumn];
    console.log(`Ligne: ${row['Code article'] || 'sans code'}, Valeur de ${parentProductColumn}:`, parentProductId);
    
    if (!parentProductId) {
      console.warn('Ligne sans référence parent:', row);
      rowsWithoutParent.push(row);
      return;
    }
    
    if (!productGroups[parentProductId]) {
      productGroups[parentProductId] = [];
    }
    productGroups[parentProductId].push(row);
  });
  
  // Si aucun produit parent n'est détecté mais qu'il y a des lignes sans parent, créer des groupes par SKU
  if (Object.keys(productGroups).length === 0 && rowsWithoutParent.length > 0) {
    console.log('Aucun produit parent détecté, création de groupes par SKU ou code article');
    
    // Essayer de grouper par SKU ou Code article
    rowsWithoutParent.forEach((row: any) => {
      // Utiliser le SKU ou Code article comme identifiant de produit parent
      const skuColumn = row['SKU'] ? 'SKU' : (row['Code article'] ? 'Code article' : null);
      
      if (skuColumn) {
        const sku = row[skuColumn];
        if (sku) {
          // Créer un identifiant unique pour ce produit en utilisant le SKU
          const productId = `PROD_${sku}`;
          
          if (!productGroups[productId]) {
            productGroups[productId] = [];
          }
          productGroups[productId].push(row);
          console.log(`Création d'un groupe produit avec identifiant: ${productId} pour SKU/Code: ${sku}`);
        }
      }
    });
  }

  // Calculer les statistiques
  const totalProducts = Object.keys(productGroups).length;
  const totalVariants = jsonData.length;
  
  console.log(`Produits détectés: ${totalProducts}, Variantes: ${totalVariants}`);
  console.log('Groupes de produits:', Object.keys(productGroups));
  if (totalProducts === 0) {
    console.error(`AUCUN PRODUIT DÉTECTÉ! Vérifiez le format du fichier et la colonne "${parentProductColumn}"`);
  }

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

// Constantes pour l'optimisation
const BATCH_SIZE = 10; // Nombre de produits à traiter par lot
const MAX_CONCURRENT_OPERATIONS = 5; // Nombre maximum d'opérations parallèles
const MAX_CONCURRENT_VARIANTS = 10; // Nombre maximum de variantes à traiter en parallèle
const MAX_CONCURRENT_IMAGES = 3; // Nombre maximum d'images à traiter en parallèle

// Interface pour les images à traiter
interface ImageToProcess {
  url: string;
  productId: string;
  variantId: string;
  isPrimary: boolean;
  type: string;
}

// Fonction utilitaire pour traiter les opérations par lots en parallèle avec limite de concurrence
async function processWithConcurrencyLimit<T, R>(items: T[], maxConcurrent: number, processor: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  
  // Traiter par lots selon la limite de concurrence
  for (let i = 0; i < items.length; i += maxConcurrent) {
    const batch = items.slice(i, i + maxConcurrent);
    const batchPromises = batch.map(processor);
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
}

// Fonction principale pour importer les produits
export const importProducts = async (
  productGroups: { [key: string]: any[] },
  config: ImportConfig,
  categoryMapping: CategoryMapping,
  columnMapping: ColumnMapping,
  onProgress: (progress: ImportProgress) => void
): Promise<ImportProgress> => {
  console.log('==== DÉBUT DE L\'IMPORTATION AVEC API OPTIMISÉE ====');
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
    // Préparer les groupes de produits pour le traitement par lots
    const parentProductIds = Object.keys(productGroups);
    const totalProducts = parentProductIds.length;
    
    // Traiter les produits par lots avec une limite de concurrence
    for (let batchIndex = 0; batchIndex < parentProductIds.length; batchIndex += BATCH_SIZE) {
      const batchProductIds = parentProductIds.slice(batchIndex, batchIndex + BATCH_SIZE);
      progress.status = `Préparation du lot ${Math.floor(batchIndex / BATCH_SIZE) + 1}/${Math.ceil(totalProducts / BATCH_SIZE)}`;
      onProgress(progress);
      
      // Traiter chaque produit du lot en parallèle avec une limite de concurrence
      await processWithConcurrencyLimit(batchProductIds, MAX_CONCURRENT_OPERATIONS, async (parentProductId) => {
        try {
          progress.current += 1;
          progress.status = `Importation du produit ${progress.current}/${progress.total}: ${parentProductId}`;
          onProgress(progress);

          const rows = productGroups[parentProductId];
          const firstRow = rows[0]; // Utiliser la première ligne pour les informations du produit principal
        // Déterminer la catégorie du produit (mapping spécifique ou catégorie par défaut)
        let categoryId = categoryMapping[parentProductId] || config.defaultCategory;
        
        // S'assurer que la catégorie n'est pas vide (ce qui causerait une erreur UUID)
        if (!categoryId) {
          console.warn(`Catégorie non définie pour le produit ${parentProductId}, importation impossible`);
          throw new Error(`La catégorie n'est pas définie pour le produit ${parentProductId}`);
        }
        
        // Utiliser les colonnes mappées pour extraire les données
        const productName = firstRow[columnMapping.productName] || '';
        const price = firstRow[columnMapping.price] ? parseFloat(firstRow[columnMapping.price]) : 0;
        const description = firstRow[columnMapping.description] || 'Produit importé automatiquement';
        
        // Traiter le grammage (convertir en nombre si nécessaire)
        let weightGsm = null;
        if (columnMapping.weightGsm && firstRow[columnMapping.weightGsm]) {
          const weightValue = firstRow[columnMapping.weightGsm];
          console.log(`Valeur de grammage brute pour ${parentProductId}:`, weightValue, typeof weightValue);
          
          if (typeof weightValue === 'number') {
            // Convertir en entier car la base de données attend un INTEGER
            weightGsm = Math.round(weightValue);
            console.log(`Grammage converti de nombre à entier:`, weightValue, '->', weightGsm);
          } else if (typeof weightValue === 'string') {
            // Essayer de convertir en nombre puis en entier
            const parsedWeight = parseFloat(weightValue.replace(/[^0-9.,]/g, '').replace(',', '.'));
            if (!isNaN(parsedWeight)) {
              weightGsm = Math.round(parsedWeight);
              console.log(`Grammage converti de string à entier:`, weightValue, '->', parsedWeight, '->', weightGsm);
            }
          }
        } else {
          console.log(`Aucun grammage défini pour ${parentProductId}`);
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
        console.log(`Image principale pour ${parentProductId}:`, {
          colonne: columnMapping.mainImage,
          valeur: mainImageUrl
        });
        
        // Créer le produit principal avec l'image_url
        const productData: ProductData = {
          name: productName,
          description: description,
          base_price: price,
          weight_gsm: weightGsm !== null ? Math.round(Number(weightGsm)) : null, // S'assurer que c'est un entier
          supplier_reference: supplierReference,
          material: material,
          is_featured: isFeatured,
          is_new: isNew,
          category_id: categoryId,
          image_url: mainImageUrl // Ajouter l'URL de l'image principale
        };
        
        // Log des données du produit avant création
        console.log(`Données du produit ${parentProductId} avant création:`, {
          ...productData,
          weight_gsm_type: typeof productData.weight_gsm,
          category_id_type: typeof productData.category_id
        });

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
            
            // Utiliser directement le code couleur (qui est déjà converti en HEX dans le prétraitement)
            // Si aucun code couleur n'est fourni, utiliser une valeur par défaut
            let hexColorCode = colorCode || '#CCCCCC';
            
            // Vérifier si le code est bien au format hexadécimal (commence par #)
            if (hexColorCode && !hexColorCode.startsWith('#')) {
              console.log(`Le code couleur ${hexColorCode} n'est pas au format HEX, ajout du préfixe #`);
              hexColorCode = `#${hexColorCode}`;
            }
            
            console.log(`Code couleur final pour la variante: ${hexColorCode}`);
            
            
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
            
            // Préparer les données de variantes pour toutes les tailles
            const variantsToCreate = Array.from(sizes).map(size => {
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
              
              // Créer une variante - pour Imbretex, on utilise toujours le code hexadécimal et pas l'URL de couleur
              return {
                product_id: newProduct.id,
                size: size,
                color: hexColorCode, // Utiliser toujours le code hexadécimal pour Imbretex
                color_url: undefined, // Ne pas utiliser l'URL de couleur pour Imbretex
                stock_quantity: 10, // Valeur par défaut
                price_adjustment: 0,
                sku: variantSku
              } as VariantData;
            });

            // Traiter les variantes en parallèle avec une limite de concurrence
            const variantResults = await processWithConcurrencyLimit(variantsToCreate, MAX_CONCURRENT_VARIANTS, async (variantData) => {
              // Ajouter la variante à la base de données
              const variantResult = await createVariant(variantData);
              
              if (!variantResult.success || !variantResult.variant) {
                throw new Error(variantResult.error || 'Erreur lors de la création de la variante');
              }
              
              return variantResult.variant;
            });
            
            // Stocker l'ID de la première variante créée pour cette couleur (pour les images)
            if (variantResults.length > 0 && !productColorMap.has(colorKey)) {
              productColorMap.set(colorKey, variantResults[0].id);
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
              try {
                // Préparer toutes les images à traiter
                const imagesToProcess = [];
                
                // Image principale (is_primary = true pour au moins une image par produit)
                if (mainImage) {
                  // IMPORTANT: Forcer au moins une image principale par produit
                  // Si c'est la première variante du produit, ou si aucune image principale n'a encore été définie
                  const isPrimary = !productsWithPrimaryImage.has(newProduct.id);
                  
                  console.log(`Traitement de l'image principale pour ${newProduct.id}, variante ${variantId}:`, {
                    url: mainImage,
                    isPrimary,
                    déjàPrincipale: productsWithPrimaryImage.has(newProduct.id)
                  });
                  
                  imagesToProcess.push({
                    url: mainImage,
                    productId: newProduct.id,
                    variantId: variantId,
                    isPrimary: isPrimary, // TRUE pour la première image du produit
                    type: 'main'
                  });
                  
                  if (isPrimary) {
                    // Marquer ce produit comme ayant déjà une image principale
                    productsWithPrimaryImage.add(newProduct.id);
                    console.log(`Image principale définie pour le produit ${newProduct.id} (OBLIGATOIRE)`);
                  }
                }
                
                // Images portées (is_primary = false)
                const modelImages = [modelImageA, modelImageB, modelImageC].filter(Boolean);
                modelImages.forEach(modelImage => {
                  imagesToProcess.push({
                    url: modelImage,
                    productId: newProduct.id,
                    variantId: variantId,
                    isPrimary: false,
                    type: 'model'
                  });
                });
                
                // Vérifier si au moins une image est marquée comme principale
                // Si aucune image n'est marquée comme principale, définir la première comme principale
                if (imagesToProcess.length > 0 && !imagesToProcess.some(img => img.isPrimary)) {
                  console.warn(`ATTENTION: Aucune image principale définie pour le produit ${newProduct.id}. Définition de la première image comme principale.`);
                  imagesToProcess[0].isPrimary = true;
                }
                
                // Traiter toutes les images en parallèle - la gestion des images principales est déléguée à l'API
                // qui s'assure qu'une seule image par produit est marquée comme principale
                const imageResults = await processWithConcurrencyLimit(imagesToProcess, MAX_CONCURRENT_IMAGES, async (img) => {
                  try {
                    // Vérifier que l'URL n'est pas vide ou invalide
                    if (!img.url || img.url === '0' || img.url === 0 || img.url === 'undefined') {
                      console.warn(`URL d'image invalide ignorée: ${img.url}`);
                      return { success: false, error: 'URL invalide' };
                    }
                    
                    const result = await addImageFromUrl(
                      img.url,
                      img.productId,
                      img.variantId,
                      img.isPrimary
                    );
                    
                    if (!result.success) {
                      console.warn(`Erreur lors de l'ajout de l'image ${img.type}: ${result.error}`);
                    } else {
                      console.log(`Image ${img.type} ajoutée pour la couleur ${colorKey}: ${img.url}`);
                    }
                    
                    return result;
                  } catch (imgError: any) {
                    console.error(`Erreur lors de l'ajout de l'image ${img.type}: ${imgError?.message || 'Erreur inconnue'}`);
                    return { success: false, error: imgError?.message || 'Erreur inconnue' };
                  }
                });
                
                console.log(`${imageResults.filter(r => r.success).length}/${imagesToProcess.length} images ajoutées avec succès pour la couleur ${colorKey}`);
              } catch (imgError: any) {
                console.error(`Erreur lors du traitement des images: ${imgError?.message || 'Erreur inconnue'}`);
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
      });
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
