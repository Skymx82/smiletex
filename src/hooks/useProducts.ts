import { useState, useEffect } from 'react';
import { Product, ProductVariant, Category } from '@/lib/products';
import * as productService from '@/lib/supabase/services/productService';

export function useAllProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const data = await productService.fetchAllProducts();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return { products, loading, error };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const productData = await productService.fetchProductById(id);
        
        if (productData) {
          const variantsData = await productService.fetchProductVariants(id);
          // Ajouter les variantes directement à l'objet produit
          setProduct({
            ...productData,
            variants: variantsData
          });
        } else {
          setProduct(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProduct();
    }
  }, [id]);

  return { product, loading, error };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCategoriesData() {
      try {
        setLoading(true);
        const data = await productService.fetchCategories();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchCategoriesData();
  }, []);

  return { categories, loading, error };
}

export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        setLoading(true);
        const data = await productService.fetchFeaturedProducts();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, []);

  return { products, loading, error };
}

export function useProductsByCategory(categoryId: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProductsByCategory() {
      try {
        setLoading(true);
        const data = await productService.fetchProductsByCategory(categoryId);
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    if (categoryId) {
      fetchProductsByCategory();
    }
  }, [categoryId]);

  return { products, loading, error };
}

export function useNewProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchNewProducts() {
      try {
        setLoading(true);
        const data = await productService.fetchNewProducts();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchNewProducts();
  }, []);

  return { products, loading, error };
}

export function useStockCheck() {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const checkStock = async (variantId: string, quantity: number = 1) => {
    try {
      setChecking(true);
      return await productService.checkProductStock(variantId, quantity);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return false;
    } finally {
      setChecking(false);
    }
  };

  return { checkStock, checking, error };
}

export function useStockUpdate() {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateStock = async (variantId: string, quantityChange: number) => {
    try {
      setUpdating(true);
      return await productService.updateProductStock(variantId, quantityChange);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return { updateStock, updating, error };
}
