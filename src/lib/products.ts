// Données de produits pour le développement
// Dans une implémentation réelle, ces données viendraient de Supabase

// Types qui correspondent au schéma de la base de données
export type Product = {
  id: string; // UUID dans la base de données réelle
  name: string;
  description: string;
  base_price: number;
  image_url: string;
  category_id: string;
  is_featured: boolean;
  is_new?: boolean;
  created_at?: string;
  updated_at?: string;
  variants?: ProductVariant[]; // Ajout du champ variants optionnel
};

export type ProductVariant = {
  id: string;
  product_id: string;
  size: string;
  color: string;
  stock_quantity: number;
  price_adjustment: number;
  sku?: string;
  created_at?: string;
  updated_at?: string;
};

export type Category = {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  created_at?: string;
  updated_at?: string;
  slug?: string; // Pour la navigation, non présent dans le schéma
};

// Données de test
const products: Product[] = [
  { 
    id: '1', 
    name: 'T-shirt Premium', 
    description: 'T-shirt 100% coton bio, idéal pour vos designs personnalisés. Fabriqué dans le respect de l\'environnement, ce t-shirt offre un confort optimal et une excellente base pour vos créations personnalisées.',
    base_price: 19.99,
    image_url: '/images/product-tshirt.jpg',
    category_id: '1',
    is_featured: true,
    is_new: false
  },
  { 
    id: '2', 
    name: 'Sweat à capuche', 
    description: 'Sweat confortable et chaud, parfait pour vos designs créatifs. Fabriqué avec un mélange de coton et polyester, ce sweat à capuche offre chaleur et confort tout en étant une toile parfaite pour vos designs personnalisés.',
    base_price: 39.99,
    image_url: '/images/product-sweatshirt.jpg',
    category_id: '2',
    is_featured: true,
    is_new: true
  },
  { 
    id: '3', 
    name: 'Tote Bag', 
    description: 'Sac en toile résistant pour afficher vos créations au quotidien. Ce tote bag en coton épais est parfait pour transporter vos affaires tout en affichant votre design personnalisé.',
    base_price: 14.99,
    image_url: '/images/product-tote.jpg',
    category_id: '3',
    is_featured: true,
    is_new: false
  },
  { 
    id: '4', 
    name: 'Mug personnalisable', 
    description: 'Mug en céramique de qualité pour vos boissons préférées.',
    base_price: 12.99,
    image_url: '/images/product-mug.jpg',
    category_id: '3',
    is_featured: false,
    is_new: false
  },
  { 
    id: '5', 
    name: 'Casquette', 
    description: 'Casquette ajustable pour un style décontracté.',
    base_price: 16.99,
    image_url: '/images/product-cap.jpg',
    category_id: '4',
    is_featured: false,
    is_new: true
  },
  { 
    id: '6', 
    name: 'Hoodie zippé', 
    description: 'Hoodie avec zip pour un confort optimal.',
    base_price: 44.99,
    image_url: '/images/product-hoodie.jpg',
    category_id: '2',
    is_featured: false,
    is_new: false
  },
];

const productVariants: ProductVariant[] = [
  { id: '1-1', product_id: '1', size: 'S', color: 'Blanc', stock_quantity: 10, price_adjustment: 0 },
  { id: '1-2', product_id: '1', size: 'M', color: 'Blanc', stock_quantity: 15, price_adjustment: 0 },
  { id: '1-3', product_id: '1', size: 'L', color: 'Blanc', stock_quantity: 12, price_adjustment: 0 },
  { id: '1-4', product_id: '1', size: 'XL', color: 'Blanc', stock_quantity: 8, price_adjustment: 2 },
  { id: '1-5', product_id: '1', size: 'S', color: 'Noir', stock_quantity: 10, price_adjustment: 0 },
  { id: '1-6', product_id: '1', size: 'M', color: 'Noir', stock_quantity: 15, price_adjustment: 0 },
  { id: '1-7', product_id: '1', size: 'L', color: 'Noir', stock_quantity: 12, price_adjustment: 0 },
  { id: '1-8', product_id: '1', size: 'XL', color: 'Noir', stock_quantity: 8, price_adjustment: 2 },
  
  { id: '2-1', product_id: '2', size: 'S', color: 'Gris', stock_quantity: 8, price_adjustment: 0 },
  { id: '2-2', product_id: '2', size: 'M', color: 'Gris', stock_quantity: 12, price_adjustment: 0 },
  { id: '2-3', product_id: '2', size: 'L', color: 'Gris', stock_quantity: 10, price_adjustment: 0 },
  { id: '2-4', product_id: '2', size: 'XL', color: 'Gris', stock_quantity: 6, price_adjustment: 3 },
  { id: '2-5', product_id: '2', size: 'S', color: 'Noir', stock_quantity: 8, price_adjustment: 0 },
  { id: '2-6', product_id: '2', size: 'M', color: 'Noir', stock_quantity: 12, price_adjustment: 0 },
  { id: '2-7', product_id: '2', size: 'L', color: 'Noir', stock_quantity: 10, price_adjustment: 0 },
  { id: '2-8', product_id: '2', size: 'XL', color: 'Noir', stock_quantity: 6, price_adjustment: 3 },
  
  { id: '3-1', product_id: '3', size: 'Unique', color: 'Écru', stock_quantity: 20, price_adjustment: 0 },
  { id: '3-2', product_id: '3', size: 'Unique', color: 'Noir', stock_quantity: 18, price_adjustment: 0 },
];

const categories: Category[] = [
  { id: '1', name: 'T-shirts', description: 'T-shirts personnalisables', image_url: '/images/category-tshirts.jpg', slug: 't-shirts' },
  { id: '2', name: 'Sweats', description: 'Sweats et hoodies personnalisables', image_url: '/images/category-sweats.jpg', slug: 'sweats' },
  { id: '3', name: 'Accessoires', description: 'Accessoires personnalisables', image_url: '/images/category-accessories.jpg', slug: 'accessories' },
];

export const getProductById = (id: string): Product & { variants?: ProductVariant[] } | undefined => {
  const product = products.find(product => product.id === id);
  if (!product) return undefined;
  
  const variants = productVariants.filter(variant => variant.product_id === id);
  
  return {
    ...product,
    variants
  };
};

export const getAllProducts = (): Product[] => {
  return products;
};

export const getProductVariants = (productId: string): ProductVariant[] => {
  return productVariants.filter(variant => variant.product_id === productId);
};

export const getProductsByCategory = (categoryId: string): Product[] => {
  return products.filter(product => product.category_id === categoryId);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(product => product.is_featured);
};

export const getNewProducts = (): Product[] => {
  return products.filter(product => product.is_new);
};

export const getCategories = (): Category[] => {
  return categories;
};

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(category => category.id === id);
};
