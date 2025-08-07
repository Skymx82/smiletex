'use client';

import { useState, useCallback, useEffect } from 'react';
import { Category } from '@/lib/products';
import { parseExcelFile, importProducts, ImportConfig, ImportProgress } from '../sologroup/services/importService';

// Types
interface PreviewData {
  headers: string[];
  rows: any[];
  productGroups: { [key: string]: any[] };
  totalProducts: number;
  totalVariants: number;
}

interface CategoryMapping {
  [parentProductId: string]: string; // Mapping produit parent -> ID catégorie
}

interface ColumnMapping {
  sku: string;
  productName: string;
  colorCode: string;
  colorUrl: string;
  size: string;
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
  [key: string]: string;
}

interface SoloGroupImportProps {
  categories: Category[];
  defaultCategory: string;
  onImportComplete: (progress: ImportProgress) => void;
}

const SOLOGROUP_COLUMN_MAPPING: ColumnMapping = {
  sku: 'SKU',
  productName: 'Nom produit',
  colorCode: 'Code Couleur',
  colorUrl: 'Color Url',
  size: 'Tailles',
  price: 'Prix',
  parentProduct: 'Produit parent',
  mainImage: 'Visuel packshot A',
  modelImageA: 'Visuel principal porté A',
  modelImageB: 'Visuel principal porté B',
  modelImageC: 'Visuel principal porté C',
  // Utiliser des valeurs par défaut pour les champs obligatoires mais non présents dans le fichier Excel
  description: '', // Sera rempli avec le nom du produit
  weightGsm: '', // Sera null
  supplierReference: 'SKU', // Utiliser SKU comme référence fournisseur
  material: '',
  isFeatured: '',
  isNew: ''
};

const SoloGroupImport: React.FC<SoloGroupImportProps> = ({ 
  categories, 
  defaultCategory,
  onImportComplete
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<ImportConfig>({
    replaceExisting: false,
    defaultCategory: defaultCategory,
  });
  const [categoryMapping, setCategoryMapping] = useState<CategoryMapping>({});
  const [columnMapping] = useState<ColumnMapping>(SOLOGROUP_COLUMN_MAPPING);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    current: 0,
    total: 0,
    status: '',
    errors: [],
  });
  const [error, setError] = useState<string | null>(null);

  // Gérer le changement de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setPreviewData(null);
    }
  };

  // Analyser le fichier Excel
  const handleParseExcelFile = useCallback(async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Analyser le fichier Excel
      const result = await parseExcelFile(file);
      setPreviewData(result);
    } catch (error) {
      console.error('Erreur lors de l\'analyse du fichier:', error);
      setError('Erreur lors de l\'analyse du fichier. Vérifiez le format.');
    } finally {
      setLoading(false);
    }
  }, [file]);

  // Lancer l'importation
  const startImport = async () => {
    if (!previewData) {
      setError('Veuillez d\'abord analyser un fichier');
      return;
    }

    setLoading(true);
    setError(null);
    setImportProgress({
      current: 0,
      total: previewData.totalVariants,
      status: 'Préparation de l\'importation...',
      errors: [],
    });

    try {
      // Lancer l'importation
      const result = await importProducts(
        previewData.productGroups,
        config,
        categoryMapping,
        columnMapping,
        (progress) => {
          setImportProgress(progress);
          // Mettre à jour le parent avec la progression
          onImportComplete(progress);
        }
      );

      console.log('Importation terminée:', result);
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      setError('Erreur lors de l\'importation. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le mapping des catégories
  const handleCategoryChange = (parentProductId: string, categoryId: string) => {
    // Vérifier que la catégorie n'est pas vide
    if (!categoryId && categories.length > 0) {
      // Si la catégorie est vide, utiliser la catégorie par défaut
      categoryId = config.defaultCategory || defaultCategory || categories[0].id;
    }
    
    console.log(`Catégorie changée pour ${parentProductId}: ${categoryId}`);
    
    setCategoryMapping(prev => ({
      ...prev,
      [parentProductId]: categoryId
    }));
  };

  // Initialiser les catégories pour tous les produits parents
  useEffect(() => {
    if (previewData && categories.length > 0) {
      // S'assurer que la catégorie par défaut est valide
      if (!config.defaultCategory && defaultCategory) {
        setConfig(prev => ({
          ...prev,
          defaultCategory: defaultCategory
        }));
      }
      
      const initialMapping: CategoryMapping = {};
      Object.keys(previewData.productGroups).forEach(parentProductId => {
        // Utiliser la catégorie par défaut de la config ou celle passée en props
        initialMapping[parentProductId] = config.defaultCategory || defaultCategory;
      });
      
      console.log('Initialisation des catégories avec:', config.defaultCategory || defaultCategory);
      setCategoryMapping(initialMapping);
    }
  }, [previewData, categories, config.defaultCategory, defaultCategory]);

  return (
    <div>
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">1. Sélectionner un fichier Excel (format SoloGroup)</h2>
        <div className="mb-4">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
          />
          <p className="text-sm text-gray-500 mt-1">
            Formats acceptés: .xlsx, .xls
          </p>
        </div>
        
        <button
          onClick={handleParseExcelFile}
          disabled={!file || loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Analyse en cours...' : 'Analyser le fichier'}
        </button>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Format sélectionné:</span> SoloGroup
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Format standard SoloGroup avec colonnes SKU, Nom produit, Code couleur, etc.
          </p>
        </div>
      </div>

      {previewData && (
        <>
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">2. Configuration de l'importation</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Catégorie par défaut</label>
              <select
                value={config.defaultCategory}
                onChange={(e) => setConfig(prev => ({ ...prev, defaultCategory: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Cette catégorie sera utilisée pour tous les produits sans catégorie spécifique.
              </p>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.replaceExisting}
                  onChange={(e) => setConfig(prev => ({ ...prev, replaceExisting: e.target.checked }))}
                  className="mr-2"
                />
                <span>Remplacer les produits existants</span>
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Si activé, les produits existants avec le même SKU seront remplacés.
              </p>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">3. Aperçu et configuration des produits</h2>
            <p className="mb-4 text-sm text-gray-600">
              {previewData.totalProducts} produits avec {previewData.totalVariants} variantes ont été détectés.
            </p>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Sélection des catégories par produit</h3>
              <p className="text-sm text-gray-600 mb-3">
                {Object.keys(previewData.productGroups).length} produits à catégoriser
              </p>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 w-16">Image</th>
                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500">Produit</th>
                      <th className="py-2 px-3 text-xs font-medium text-gray-500 w-16 text-center">Variantes</th>
                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 w-64">Catégorie</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(previewData.productGroups).map(([parentProductId, variants]) => {
                      // Récupérer les informations du premier variant pour afficher le nom du produit
                      const firstVariant = variants[0];
                      const productName = firstVariant[columnMapping.productName] || parentProductId;
                      const supplierRef = firstVariant[columnMapping.supplierReference] || '';
                      const variantCount = variants.length;
                      const imageUrl = firstVariant[columnMapping.modelImageA] || '';
                      
                      return (
                        <tr key={parentProductId} className="hover:bg-gray-50">
                          <td className="py-2 px-3 whitespace-nowrap">
                            {imageUrl ? (
                              <div className="h-12 w-12 rounded border overflow-hidden bg-gray-100 flex items-center justify-center">
                                <img 
                                  src={imageUrl} 
                                  alt={productName} 
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    // Fallback pour les images qui ne se chargent pas
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0yNCAyNGgtMjR2LTI0aDI0djI0em0tMi0yMmgtMjB2MjBoMjB2LTIwem0tNC4xMTggMTQuMDY0Yy0yLjI5My0uNTI5LTQuNDI3LS45OTMtMy4zOTQtMi45NDUgMy4xNDYtNS45NDIuODM0LTkuMTE5LTIuNDg4LTkuMTE5LTMuMzg4IDAtNS42NDMgMy4yOTktMi40ODggOS4xMTkgMS4wNjQgMS45NjMtMS4xNSAyLjQyNy0zLjM5NCAyLjk0NS0yLjA0OC40NzMtMi4xMjQgMS40OS0yLjExOCAzLjI2OWwuMDA0LjY2N2gxNS45OTNsLjAwMy0uNjQ2Yy4wMDctMS43OTItLjA2Mi0yLjgxNS0yLjExOC0zLjI5eiIvPjwvc3ZnPg==';
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="h-12 w-12 rounded border bg-gray-100 flex items-center justify-center text-gray-400">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={productName}>
                              {productName}
                            </div>
                            {supplierRef && (
                              <div className="text-xs text-gray-500" title={`Réf: ${supplierRef}`}>
                                Réf: {supplierRef}
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {variantCount}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <select
                              value={categoryMapping[parentProductId] || config.defaultCategory}
                              onChange={(e) => handleCategoryChange(parentProductId, e.target.value)}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                              {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>


          </div>

          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">4. Lancer l'importation</h2>
            
            {importProgress.total > 0 && (
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span>{importProgress.status}</span>
                  <span>{importProgress.current}/{importProgress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full" 
                    style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                  ></div>
                </div>
                
                {importProgress.errors.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-red-600 font-medium mb-2">Erreurs ({importProgress.errors.length}):</h3>
                    <ul className="text-sm text-red-600 list-disc pl-5 max-h-40 overflow-y-auto">
                      {importProgress.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            <button
              onClick={startImport}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? 'Importation en cours...' : 'Lancer l\'importation'}
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Cette opération peut prendre plusieurs minutes selon le nombre de produits.
            </p>
          </div>
        </>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoloGroupImport;
