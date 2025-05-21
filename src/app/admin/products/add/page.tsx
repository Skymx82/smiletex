'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Category } from '@/lib/products';
import { fetchCategories } from '@/lib/supabase/services/productService';
import { addProduct, addProductVariant, uploadProductImage } from '@/lib/supabase/services/adminService';

type ProductFormData = {
  name: string;
  description: string;
  base_price: number;
  category_id: string;
  is_featured: boolean;
  is_new: boolean;
  image_file: File | null;
  weight_gsm: number | null;
  supplier_reference: string;
  material: string;
};

type VariantFormData = {
  size: string;
  color: string;
  stock_quantity: number;
  price_adjustment: number;
  sku: string;
};

// Tailles et couleurs prédéfinies pour faciliter la génération de variantes
const PREDEFINED_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const PREDEFINED_COLORS = [
  { name: 'Blanc', hex: '#FFFFFF' },
  { name: 'Noir', hex: '#000000' },
  { name: 'Gris', hex: '#808080' },
  { name: 'Bleu', hex: '#0000FF' },
  { name: 'Rouge', hex: '#FF0000' },
  { name: 'Vert', hex: '#008000' }
];

export default function AddProductPage() {
  const router = useRouter();
  
  // États pour le formulaire de produit
  const [productData, setProductData] = useState<ProductFormData>({
    name: '',
    description: '',
    base_price: 0,
    category_id: '',
    is_featured: false,
    is_new: false,
    image_file: null,
    weight_gsm: null,
    supplier_reference: '',
    material: '',
  });
  
  // État pour les variantes
  const [variants, setVariants] = useState<VariantFormData[]>([
    { size: '', color: '', stock_quantity: 0, price_adjustment: 0, sku: '' }
  ]);
  
  // États pour les catégories
  const [categories, setCategories] = useState<Category[]>([]);
  
  // États pour le chargement et les erreurs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // États pour le système simplifié de génération de variantes
  const [sizesInput, setSizesInput] = useState<string>('');
  const [colorsInput, setColorsInput] = useState<string>('');
  const [defaultStock, setDefaultStock] = useState<number>(10);
  const [defaultPriceAdjustment, setDefaultPriceAdjustment] = useState<number>(0);
  
  // Charger les catégories au chargement de la page
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error('Erreur lors du chargement des catégories:', err);
      }
    };
    
    loadCategories();
  }, []);
  
  // Gérer les changements dans le formulaire de produit
  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setProductData({ ...productData, [name]: checked });
    } else {
      setProductData({ ...productData, [name]: value });
    }
  };
  
  // Gérer le téléchargement d'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductData({ ...productData, image_file: file });
      
      // Créer une prévisualisation de l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Gérer les changements dans les variantes
  const handleVariantChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [name]: value };
    setVariants(newVariants);
  };
  
  // Ajouter une nouvelle variante
  const addVariant = () => {
    setVariants([...variants, { size: '', color: '', stock_quantity: 0, price_adjustment: 0, sku: '' }]);
  };
  
  // Supprimer une variante
  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      const newVariants = [...variants];
      newVariants.splice(index, 1);
      setVariants(newVariants);
    }
  };
  
  // Générer les variantes à partir des entrées simples de tailles et couleurs
  const generateVariants = () => {
    // Extraction des tailles et couleurs à partir des entrées séparées par des virgules
    const sizes = sizesInput.split(',').map(s => s.trim()).filter(s => s !== '');
    const colors = colorsInput.split(',').map(c => c.trim()).filter(c => c !== '');
    
    if (sizes.length === 0 || colors.length === 0) {
      setError('Veuillez entrer au moins une taille et une couleur');
      return;
    }
    
    const newVariants: VariantFormData[] = [];
    
    // Génération de toutes les combinaisons possibles
    sizes.forEach(size => {
      colors.forEach(color => {
        // Utiliser le code hexadécimal sans le # pour le SKU
        const colorHex = color.replace('#', '');
        
        // Générer un SKU basique
        const sku = `${productData.name.substring(0, 3).toUpperCase() || 'PRD'}-${size}-${colorHex}`;
        
        newVariants.push({
          size,
          color, // Le code hexa complet est stocké comme couleur
          stock_quantity: defaultStock,
          price_adjustment: defaultPriceAdjustment,
          sku
        });
      });
    });
    
    setVariants(newVariants);
  };
  
  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Valider les données
      if (!productData.name || !productData.description || productData.base_price <= 0) {
        throw new Error('Veuillez remplir tous les champs obligatoires du produit');
      }
      
      if (!productData.category_id) {
        throw new Error('Veuillez sélectionner une catégorie');
      }
      
      // Vérifier que toutes les variantes ont des données valides
      for (const variant of variants) {
        if (!variant.size || !variant.color || variant.stock_quantity < 0) {
          throw new Error('Veuillez remplir correctement toutes les variantes');
        }
      }
      
      // Télécharger l'image si elle existe
      let imageUrl = '';
      if (productData.image_file) {
        try {
          // Télécharger directement vers Supabase Storage
          const fileName = `${Date.now()}-${productData.image_file.name.replace(/\s+/g, '-')}`;
          const supabaseUrl = await uploadProductImage(productData.image_file, fileName);
          if (supabaseUrl) {
            imageUrl = supabaseUrl;
          } else {
            console.warn('Impossible de télécharger l\'image, continuation sans image');
          }
        } catch (uploadError) {
          console.warn('Erreur lors du téléchargement de l\'image, continuation sans image:', uploadError);
        }
      }
      
      // Créer le produit
      const productToAdd = {
        name: productData.name,
        description: productData.description,
        base_price: productData.base_price,
        image_url: imageUrl,
        category_id: productData.category_id,
        is_featured: productData.is_featured,
        is_new: productData.is_new,
        weight_gsm: productData.weight_gsm,
        supplier_reference: productData.supplier_reference,
        material: productData.material,
      };
      
      const newProduct = await addProduct(productToAdd);
      if (!newProduct) {
        throw new Error('Erreur lors de la création du produit');
      }
      
      // Ajouter les variantes
      for (const variant of variants) {
        try {
          // Valider les données de la variante
          if (!variant.size || !variant.color) {
            setError('Chaque variante doit avoir une taille et une couleur');
            continue; // Passer à la variante suivante au lieu d'arrêter complètement
          }
          
          // Convertir explicitement en nombres et vérifier que ce sont des nombres valides
          const stockQuantity = Number(variant.stock_quantity);
          const priceAdjustment = Number(variant.price_adjustment);
          
          if (isNaN(stockQuantity) || isNaN(priceAdjustment)) {
            setError(`Valeurs numériques invalides pour la variante ${variant.size} ${variant.color}`);
            continue;
          }
          
          // Générer un SKU unique pour chaque variante
          // Utiliser un timestamp pour garantir l'unicité même si les tailles et couleurs sont identiques
          const timestamp = Date.now();
          const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          
          const variantToAdd = {
            product_id: newProduct.id,
            size: variant.size,
            color: variant.color,
            stock_quantity: stockQuantity,
            price_adjustment: priceAdjustment,
            sku: variant.sku || `${newProduct.id.substring(0, 8)}-${variant.size}-${variant.color}-${timestamp}-${randomSuffix}`.toLowerCase(),
          };
          
          console.log('Ajout de la variante:', variantToAdd);
          
          const result = await addProductVariant(variantToAdd);
          if (!result) {
            console.error(`Échec de l'ajout de la variante ${variant.size} ${variant.color}`);
            setError(`Échec de l'ajout de la variante ${variant.size} ${variant.color}. Vérifiez la console pour plus de détails.`);
            // Continuer avec les autres variantes au lieu d'arrêter complètement
          } else {
            console.log(`Variante ${variant.size} ${variant.color} ajoutée avec succès, ID: ${result.id}`);
          }
        } catch (variantError) {
          console.error('Erreur lors de l\'ajout d\'une variante:', variantError);
          setError(`Erreur lors de l'ajout de la variante ${variant.size} ${variant.color}: ${variantError instanceof Error ? variantError.message : 'Erreur inconnue'}`);
          // Continuer avec les autres variantes au lieu d'arrêter complètement
        }
      }
      
      // Vérifier si nous avons des erreurs mais continuer quand même
      if (error) {
        console.warn('Des erreurs sont survenues lors de l\'ajout des variantes, mais le produit a été créé.');
      }
      
      // Succès !
      setSuccess(true);
      
      // Rediriger vers la liste des produits après 2 secondes
      setTimeout(() => {
        router.push('/admin/products');
      }, 2000);
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 text-black">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ajouter un Produit</h1>
        <Link
          href="/admin/products"
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
        >
          Retour à la liste
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Produit ajouté avec succès ! Redirection en cours...
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Informations du Produit</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Nom du Produit *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={productData.name}
                onChange={handleProductChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="base_price">
                Prix de Base (€) *
              </label>
              <input
                type="number"
                id="base_price"
                name="base_price"
                value={productData.base_price}
                onChange={handleProductChange}
                min="0"
                step="0.01"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category_id">
                Catégorie *
              </label>
              <select
                id="category_id"
                name="category_id"
                value={productData.category_id}
                onChange={handleProductChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
                Image du Produit
              </label>
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Prévisualisation"
                    className="h-32 w-auto object-contain"
                  />
                </div>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={productData.description}
                onChange={handleProductChange}
                rows={4}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              ></textarea>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_featured"
                name="is_featured"
                checked={productData.is_featured}
                onChange={handleProductChange}
                className="mr-2"
              />
              <label className="text-gray-700 text-sm font-bold" htmlFor="is_featured">
                Produit en Vedette
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_new"
                name="is_new"
                checked={productData.is_new}
                onChange={handleProductChange}
                className="mr-2"
              />
              <label className="text-gray-700 text-sm font-bold" htmlFor="is_new">
                Nouveau Produit
              </label>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="weight_gsm">
                Grammage (g/m²)
              </label>
              <input
                type="number"
                id="weight_gsm"
                name="weight_gsm"
                value={productData.weight_gsm || ''}
                onChange={handleProductChange}
                min="0"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Ex: 180"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="supplier_reference">
                Référence Fournisseur
              </label>
              <input
                type="text"
                id="supplier_reference"
                name="supplier_reference"
                value={productData.supplier_reference}
                onChange={handleProductChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Ex: REF-12345"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="material">
                Matière
              </label>
              <input
                type="text"
                id="material"
                name="material"
                value={productData.material}
                onChange={handleProductChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Ex: 100% coton bio"
              />
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Variantes du Produit</h2>
            <button
              type="button"
              onClick={addVariant}
              className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md hover:bg-indigo-200 transition-colors"
            >
              + Ajouter une variante
            </button>
          </div>
          
          <div className="bg-gray-100 p-6 rounded-lg mb-6 border border-gray-200">
            <h3 className="font-medium text-lg mb-4 text-gray-800">Générateur automatique de variantes</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Tailles (séparées par des virgules)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={sizesInput}
                    onChange={(e) => setSizesInput(e.target.value)}
                    placeholder="XS,S,M,L,XL"
                    className="shadow appearance-none border rounded w-full py-2 px-3 pr-8 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Exemple: XS,S,M,L,XL</p>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Couleurs (séparées par des virgules)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={colorsInput}
                    onChange={(e) => setColorsInput(e.target.value)}
                    placeholder="#000000,#FFFFFF,#FF0000,#0000FF"
                    className="shadow appearance-none border rounded w-full py-2 px-3 pr-8 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {PREDEFINED_COLORS.map((color) => (
                    <div 
                      key={color.hex} 
                      className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded"
                      onClick={() => {
                        const currentColors = colorsInput.split(',').map(c => c.trim()).filter(c => c !== '');
                        if (!currentColors.includes(color.hex)) {
                          const newColors = [...currentColors, color.hex].join(',');
                          setColorsInput(newColors);
                        }
                      }}
                    >
                      <div 
                        className="w-6 h-6 mr-1 rounded border border-gray-300" 
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-xs">{color.name}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Exemple: #000000,#FFFFFF,#FF0000 (codes hexadécimaux)</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">  
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Stock par défaut
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={defaultStock}
                    onChange={(e) => setDefaultStock(Number(e.target.value))}
                    className="shadow appearance-none border rounded w-full py-2 px-3 pr-8 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
                    min="0"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Ajustement de prix par défaut (€)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={defaultPriceAdjustment}
                    onChange={(e) => setDefaultPriceAdjustment(Number(e.target.value))}
                    className="shadow appearance-none border rounded w-full py-2 px-3 pr-8 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
                    step="0.01"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                type="button"
                onClick={generateVariants}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md flex items-center transition-all duration-200 transform hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Générer les variantes
              </button>
            </div>
          </div>
          
          {variants.map((variant, index) => (
            <div key={index} className="border p-4 rounded-md mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Variante #{index + 1}</h3>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Supprimer
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`size-${index}`}>
                    Taille *
                  </label>
                  <input
                    type="text"
                    id={`size-${index}`}
                    name="size"
                    value={variant.size}
                    onChange={(e) => handleVariantChange(index, e)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`color-${index}`}>
                    Couleur *
                  </label>
                  <input
                    type="text"
                    id={`color-${index}`}
                    name="color"
                    value={variant.color}
                    onChange={(e) => handleVariantChange(index, e)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`stock-${index}`}>
                    Stock *
                  </label>
                  <input
                    type="number"
                    id={`stock-${index}`}
                    name="stock_quantity"
                    value={variant.stock_quantity}
                    onChange={(e) => handleVariantChange(index, e)}
                    min="0"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`price-adj-${index}`}>
                    Ajustement de Prix (€)
                  </label>
                  <input
                    type="number"
                    id={`price-adj-${index}`}
                    name="price_adjustment"
                    value={variant.price_adjustment}
                    onChange={(e) => handleVariantChange(index, e)}
                    step="0.01"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`sku-${index}`}>
                    SKU
                  </label>
                  <input
                    type="text"
                    id={`sku-${index}`}
                    name="sku"
                    value={variant.sku}
                    onChange={(e) => handleVariantChange(index, e)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer le Produit'}
          </button>
        </div>
      </form>
    </div>
  );
}
