'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/lib/products';
import { fetchCategories } from '@/lib/supabase/services/productService';
import { parseExcelFile, importProducts, ImportConfig, ImportProgress } from './services/importService';

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
  colorUrl: string; // Nouveau champ pour l'URL de l'image de couleur
  size: string; // Nouveau champ pour la taille
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

const ProductImportPage = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [config, setConfig] = useState<ImportConfig>({
    replaceExisting: false,
    defaultCategory: '',
  });
  const [categoryMapping, setCategoryMapping] = useState<CategoryMapping>({});
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    sku: 'SKU',
    productName: 'Nom produit',
    colorCode: 'Code couleur',
    colorUrl: 'URL Couleur', // Valeur par défaut pour le mappage
    size: 'Taille', // Valeur par défaut pour la taille
    price: 'Prix',
    parentProduct: 'Produit parent',
    mainImage: 'Visuel Principal',
    modelImageA: 'Visuel principal porté A',
    modelImageB: 'Visuel principal porté B',
    modelImageC: 'Visuel principal porté C',
    description: 'Description',
    weightGsm: 'Grammage',
    supplierReference: 'Référence fournisseur',
    material: 'Matière',
    isFeatured: 'Mis en avant',
    isNew: 'Nouveauté'
  });
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    current: 0,
    total: 0,
    status: '',
    errors: [],
  });
  const [error, setError] = useState<string | null>(null);

  // Charger les catégories au chargement de la page
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
        if (fetchedCategories.length > 0) {
          setConfig(prev => ({ ...prev, defaultCategory: fetchedCategories[0].id }));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        setError('Impossible de charger les catégories. Veuillez réessayer.');
      }
    };

    loadCategories();
  }, []);

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
      setError('Veuillez d\'abord analyser le fichier');
      return;
    }

    setLoading(true);
    setImportProgress({
      current: 0,
      total: previewData.totalProducts,
      status: 'Préparation de l\'importation...',
      errors: [],
    });

    try {
      // Utiliser le service d'importation avec le mapping des catégories
      await importProducts(
        previewData.productGroups,
        config,
        categoryMapping,
        columnMapping,
        (progress) => {
          setImportProgress(progress);
        }
      );
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      setError('Une erreur est survenue pendant l\'importation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Importation de produits</h1>
        <Link 
          href="/admin/products" 
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
        >
          Retour à la liste
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">1. Sélectionner un fichier</h2>
        <div className="mb-4">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Fichier sélectionné: {file.name}
            </p>
          )}
        </div>
        <button
          onClick={handleParseExcelFile}
          disabled={!file || loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Analyse en cours...' : 'Analyser le fichier'}
        </button>
      </div>

      {previewData && (
        <>
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">2. Configuration</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Catégorie par défaut</label>
              <select
                value={config.defaultCategory}
                onChange={(e) => setConfig({ ...config, defaultCategory: e.target.value })}
                className="w-full p-2 border rounded"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Cette catégorie sera utilisée pour les produits sans catégorie spécifique.
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Mappage des colonnes</label>
              <div className="border rounded p-4 mb-4 max-h-60 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  {previewData && previewData.headers && [
                    { id: 'sku', label: 'SKU' },
                    { id: 'productName', label: 'Nom produit' },
                    { id: 'colorCode', label: 'Code couleur' },
                    { id: 'colorUrl', label: 'URL image couleur' },
                    { id: 'size', label: 'Taille' },
                    { id: 'price', label: 'Prix' },
                    { id: 'parentProduct', label: 'Produit parent' },
                    { id: 'description', label: 'Description' },
                    { id: 'weightGsm', label: 'Grammage (g/m²)' },
                    { id: 'supplierReference', label: 'Réf. fournisseur' },
                    { id: 'material', label: 'Matière' },
                    { id: 'isFeatured', label: 'Mis en avant' },
                    { id: 'isNew', label: 'Nouveauté' },
                    { id: 'mainImage', label: 'Visuel Principal' },
                    { id: 'modelImageA', label: 'Visuel porté A' },
                    { id: 'modelImageB', label: 'Visuel porté B' },
                    { id: 'modelImageC', label: 'Visuel porté C' }
                  ].map(field => (
                    <div key={field.id} className="mb-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      <select
                        value={columnMapping[field.id]}
                        onChange={(e) => {
                          setColumnMapping(prev => ({
                            ...prev,
                            [field.id]: e.target.value
                          }));
                        }}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Non utilisé</option>
                        {previewData.headers.map(header => (
                          <option key={header} value={header}>
                            {header}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
              
              <label className="block text-gray-700 mb-2">Attribution des catégories</label>
              <div className="border rounded p-4 max-h-60 overflow-y-auto">
                {previewData && Object.keys(previewData.productGroups).length > 0 ? (
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-left py-2">Image</th>
                        <th className="text-left py-2">Produit parent</th>
                        <th className="text-left py-2">Nom du produit</th>
                        <th className="text-left py-2">Catégorie</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(previewData.productGroups).map(([parentId, rows]) => {
                        // Récupérer la première image disponible dans la ligne
                        const firstRow = rows[0];
                        const imageColumn = columnMapping.mainImage || "Visuel Principal";
                        const imageUrl = firstRow[imageColumn] || firstRow["Visuel Principal"] || 
                                       firstRow["Image"] || firstRow["URL Image"] || "/images/placeholder.jpg";
                        
                        return (
                          <tr key={parentId} className="border-t">
                            <td className="py-2">
                              <div className="relative h-16 w-16 rounded overflow-hidden border border-gray-200">
                                <Image 
                                  src={imageUrl} 
                                  alt={firstRow["Nom produit"] || "Produit"}
                                  fill
                                  sizes="64px"
                                  className="object-cover"
                                  onError={(e) => {
                                    // Fallback en cas d'erreur de chargement de l'image
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/images/placeholder.jpg";
                                  }}
                                />
                              </div>
                            </td>
                            <td className="py-2">{parentId}</td>
                            <td className="py-2">{firstRow["Nom produit"]}</td>
                            <td className="py-2">
                            <select
                              value={categoryMapping[parentId] || config.defaultCategory}
                              onChange={(e) => {
                                setCategoryMapping(prev => ({
                                  ...prev,
                                  [parentId]: e.target.value
                                }));
                              }}
                              className="w-full p-1 border rounded"
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
                ) : (
                  <p className="text-gray-500">Aucun produit à afficher.</p>
                )}
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-sm text-gray-500">
                  Attribuez une catégorie à chaque produit parent.
                </p>
                <button 
                  onClick={() => {
                    // Appliquer la catégorie par défaut à tous les produits
                    if (previewData) {
                      const newMapping: CategoryMapping = {};
                      Object.keys(previewData.productGroups).forEach(parentId => {
                        newMapping[parentId] = config.defaultCategory;
                      });
                      setCategoryMapping(newMapping);
                    }
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Appliquer la catégorie par défaut à tous
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.replaceExisting}
                  onChange={(e) => setConfig({ ...config, replaceExisting: e.target.checked })}
                  className="mr-2"
                />
                <span>Remplacer les produits existants (si même SKU)</span>
              </label>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">3. Aperçu des données</h2>
            
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Nombre de produits à créer:</span>
                <span>{previewData.totalProducts}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Nombre de variantes à créer:</span>
                <span>{previewData.totalVariants}</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    {previewData.headers.slice(0, 10).map((header, index) => (
                      <th key={index} className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                    {previewData.headers.length > 10 && (
                      <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500">
                        +{previewData.headers.length - 10} colonnes
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {previewData.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : ''}>
                      {previewData.headers.slice(0, 10).map((header, colIndex) => (
                        <td key={colIndex} className="py-2 px-3 border-b text-sm">
                          {row[header]?.toString().substring(0, 30) || ''}
                          {row[header]?.toString().length > 30 ? '...' : ''}
                        </td>
                      ))}
                      {previewData.headers.length > 10 && (
                        <td className="py-2 px-3 border-b text-sm text-gray-500">
                          ...
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.rows.length < previewData.totalVariants && (
                <p className="text-sm text-gray-500 mt-2">
                  Affichage de {previewData.rows.length} lignes sur {previewData.totalVariants}.
                </p>
              )}
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
    </div>
  );
};

export default ProductImportPage;
