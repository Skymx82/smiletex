-- Modification de la table products pour ajouter le grammage et la référence fournisseur
ALTER TABLE products 
ADD COLUMN weight_gsm INTEGER,
ADD COLUMN supplier_reference VARCHAR(100);

-- Commentaires pour expliquer les nouveaux champs
COMMENT ON COLUMN products.weight_gsm IS 'Grammage du produit en g/m²';
COMMENT ON COLUMN products.supplier_reference IS 'Référence du produit chez le fournisseur';

-- Mise à jour du timestamp
UPDATE products SET updated_at = NOW();
