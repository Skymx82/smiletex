-- Création d'une nouvelle table pour gérer les images multiples par produit et par variante
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajout d'un index pour accélérer les recherches par produit
CREATE INDEX idx_product_images_product_id ON product_images(product_id);

-- Ajout d'un index pour accélérer les recherches par variante
CREATE INDEX idx_product_images_variant_id ON product_images(variant_id);

-- Ajout d'une contrainte pour s'assurer qu'il n'y a qu'une seule image primaire par produit
CREATE UNIQUE INDEX idx_product_primary_image 
ON product_images(product_id) 
WHERE is_primary = true;

-- Ajout d'une contrainte pour s'assurer qu'il n'y a qu'une seule image primaire par variante
CREATE UNIQUE INDEX idx_variant_primary_image 
ON product_images(variant_id) 
WHERE is_primary = true AND variant_id IS NOT NULL;

-- Commentaires pour expliquer la table
COMMENT ON TABLE product_images IS 'Stocke les images multiples pour les produits et leurs variantes';
COMMENT ON COLUMN product_images.product_id IS 'ID du produit associé à cette image';
COMMENT ON COLUMN product_images.variant_id IS 'ID de la variante associée à cette image (peut être NULL si l''image est pour le produit général)';
COMMENT ON COLUMN product_images.image_url IS 'URL de l''image stockée';
COMMENT ON COLUMN product_images.is_primary IS 'Indique si cette image est l''image principale pour ce produit ou cette variante';
COMMENT ON COLUMN product_images.position IS 'Position de l''image dans la galerie (pour l''ordre d''affichage)';

-- Fonction pour migrer les images existantes des produits vers la nouvelle table
CREATE OR REPLACE FUNCTION migrate_existing_product_images()
RETURNS void AS $$
BEGIN
  -- Insérer les images existantes des produits dans la nouvelle table
  INSERT INTO product_images (product_id, image_url, is_primary, position)
  SELECT 
    id, 
    image_url, 
    true, -- Définir comme image principale
    0     -- Position par défaut
  FROM products 
  WHERE image_url IS NOT NULL AND image_url != '';
  
  -- Note: Nous ne supprimons pas la colonne image_url de la table products pour maintenir la compatibilité
END;
$$ LANGUAGE plpgsql;

-- Exécuter la migration des images existantes
SELECT migrate_existing_product_images();
