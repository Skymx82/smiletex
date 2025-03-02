'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Category } from '@/lib/products';
import { fetchCategories } from '@/lib/supabase/services/productService';
import { addProduct, addProductVariant, uploadProductImage, uploadImageViaLocalApi } from '@/lib/supabase/services/adminService';

type ProductFormData = {
  name: string;
  description: string;
  base_price: number;
  category_id: string;
  is_featured: boolean;
  is_new: boolean;
  image_file: File | null;
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
const PREDEFINED_COLORS = ['Blanc', 'Noir', 'Gris', 'Bleu', 'Rouge', 'Vert'];

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
  
  // États pour la génération de variantes
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [defaultStock, setDefaultStock] = useState<number>(10);
  const [defaultPriceAdjustment, setDefaultPriceAdjustment] = useState<number>(0);
  const [showBulkGenerator, setShowBulkGenerator] = useState<boolean>(false);
  
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
  
  // Gérer les changements dans la sélection des tailles pour la génération en masse
  const handleSizeSelection = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size) 
        : [...prev, size]
    );
  };
  
  // Gérer les changements dans la sélection des couleurs pour la génération en masse
  const handleColorSelection = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color) 
        : [...prev, color]
    );
  };
  
  // Générer les variantes en masse
  const generateVariants = () => {
    if (selectedSizes.length === 0 || selectedColors.length === 0) {
      setError('Veuillez sélectionner au moins une taille et une couleur');
      return;
    }
    
    const newVariants: VariantFormData[] = [];
    
    selectedSizes.forEach(size => {
      selectedColors.forEach(color => {
        // Générer un SKU basique
        const sku = `${productData.name.substring(0, 3).toUpperCase()}-${size}-${color.substring(0, 3).toUpperCase()}`;
        
        newVariants.push({
          size,
          color,
          stock_quantity: defaultStock,
          price_adjustment: defaultPriceAdjustment,
          sku
        });
      });
    });
    
    setVariants(newVariants);
    setShowBulkGenerator(false);
  };
  
  // Sélectionner toutes les tailles
  const selectAllSizes = () => {
    setSelectedSizes([...PREDEFINED_SIZES]);
  };
  
  // Désélectionner toutes les tailles
  const deselectAllSizes = () => {
    setSelectedSizes([]);
  };
  
  // Sélectionner toutes les couleurs
  const selectAllColors = () => {
    setSelectedColors([...PREDEFINED_COLORS]);
  };
  
  // Désélectionner toutes les couleurs
  const deselectAllColors = () => {
    setSelectedColors([]);
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
          // Essayer d'abord l'API locale
          const uploadedUrl = await uploadImageViaLocalApi(productData.image_file);
          if (uploadedUrl) {
            imageUrl = uploadedUrl;
          } else {
            console.warn('Impossible de télécharger l\'image via l\'API locale, essai via Supabase');
            
            // Fallback à Supabase si l'API locale échoue
            const fileName = `${Date.now()}-${productData.image_file.name.replace(/\s+/g, '-')}`;
            const supabaseUrl = await uploadProductImage(productData.image_file, fileName);
            if (supabaseUrl) {
              imageUrl = supabaseUrl;
            } else {
              console.warn('Impossible de télécharger l\'image, continuation sans image');
            }
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
      };
      
      const newProduct = await addProduct(productToAdd);
      if (!newProduct) {
        throw new Error('Erreur lors de la création du produit');
      }
      
      // Ajouter les variantes
      for (const variant of variants) {
        const variantToAdd = {
          product_id: newProduct.id,
          size: variant.size,
          color: variant.color,
          stock_quantity: Number(variant.stock_quantity),
          price_adjustment: Number(variant.price_adjustment),
          sku: variant.sku,
        };
        
        const result = await addProductVariant(variantToAdd);
        if (!result) {
          throw new Error('Erreur lors de l\'ajout d\'une variante');
        }
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
    <div className="container mx-auto px-4 py-8">
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
          
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowBulkGenerator(!showBulkGenerator)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-4"
            >
              {showBulkGenerator ? 'Masquer le générateur de variantes' : 'Générer des variantes en masse'}
            </button>
            
            {showBulkGenerator && (
              <div className="bg-gray-100 p-4 rounded-md mb-4">
                <h3 className="font-medium mb-2">Générateur de variantes</h3>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Tailles
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {PREDEFINED_SIZES.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSizeSelection(size)}
                        className={`px-3 py-1 rounded-md text-sm ${
                          selectedSizes.includes(size)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllSizes}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Tout sélectionner
                    </button>
                    <button
                      type="button"
                      onClick={deselectAllSizes}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Tout désélectionner
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Couleurs
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {PREDEFINED_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleColorSelection(color)}
                        className={`px-3 py-1 rounded-md text-sm ${
                          selectedColors.includes(color)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllColors}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Tout sélectionner
                    </button>
                    <button
                      type="button"
                      onClick={deselectAllColors}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Tout désélectionner
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Stock par défaut
                    </label>
                    <input
                      type="number"
                      value={defaultStock}
                      onChange={(e) => setDefaultStock(Number(e.target.value))}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Ajustement de prix par défaut
                    </label>
                    <input
                      type="number"
                      value={defaultPriceAdjustment}
                      onChange={(e) => setDefaultPriceAdjustment(Number(e.target.value))}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={generateVariants}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                  Générer {selectedSizes.length * selectedColors.length} variantes
                </button>
              </div>
            )}
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
