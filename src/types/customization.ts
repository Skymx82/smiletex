// Types pour la personnalisation des produits

// Types simplifiés pour une meilleure expérience utilisateur
export type MarkingType = 'impression' | 'broderie' | 'flocage';

// Positions prédéfinies pour faciliter le choix de l'utilisateur
export type Position = 
  | 'devant-pec' 
  | 'devant-pecs' 
  | 'devant-centre' 
  | 'devant-complet' 
  | 'dos-haut' 
  | 'dos-complet';

// Type de contenu simplifié (texte ou image)
export type ContentType = 'text' | 'image';

// Face du vêtement (devant ou derrière)
export type Face = 'devant' | 'derriere';

// Définition d'une personnalisation individuelle (pour le devant et/ou le derrière)
export type SingleCustomization = {
  // Type d'impression (broderie, flocage, etc.)
  type_impression: string;
  
  // Positions prédéfinies pour chaque face (plus facile pour l'utilisateur que des coordonnées x/y)
  // Peut être undefined si aucune position n'est sélectionnée
  position?: Position | string; // Pour rétro-compatibilité
  position_avant?: Position | string;
  position_arriere?: Position | string;
  
  // Type de contenu (texte ou image)
  type: ContentType;
  
  // Champs pour personnalisation de texte
  texte?: string;
  couleur_texte?: string;
  police?: string;
  
  // Champ pour personnalisation d'image
  image_url?: string;
  
  // Face du vêtement (devant ou derrière) - pour rétro-compatibilité
  face?: Face;
  
  // Champ interne pour suivre l'état du téléchargement de l'image
  _uploadingImage?: boolean;
};

// Type de personnalisation complet permettant de personnaliser le devant et le derrière
export type ProductCustomization = {
  // Informations essentielles du produit
  productId?: string;
  
  // Personnalisations pour chaque face (devant et/ou derrière)
  customizations: SingleCustomization[];
};

// Options disponibles pour la personnalisation
export type CustomizationOptions = {
  fonts: Array<{id: string, name: string, preview?: string}>;
  colors: Array<{id: string, name: string, hex: string}>;
  markingTypes: Array<{id: MarkingType, name: string, price?: number, description?: string}>;
  positions: Array<{id: Position | string, name: string, icon?: string}>;
};

// État de l'éditeur de personnalisation (simplifié)
export type CustomizerState = {
  productId: string;
  productName: string;
  productImage: string;
  selectedSize: string;
  selectedColor: string;
  customization: ProductCustomization | null;
  isEditing: boolean;
};
