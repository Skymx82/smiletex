// Types pour la personnalisation des produits

export type MarkingType = 'impression' | 'broderie';

export type Side = 'front' | 'back';

export type TextCustomization = {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  position: {
    x: number;
    y: number;
  };
  rotation: number;
  side: Side;
};

export type ImageCustomization = {
  type: 'image';
  imageUrl: string;
  width: number;
  height: number;
  position: {
    x: number;
    y: number;
  };
  rotation: number;
  side: Side;
};

export type Customization = TextCustomization | ImageCustomization;

export type ProductCustomization = {
  productId: string;
  variantId: string;
  size: string;
  color: string;
  markingType: MarkingType;
  customizations: Customization[];
};

// Options disponibles pour la personnalisation
export type CustomizationOptions = {
  fonts: string[];
  colors: string[];
  markingTypes: MarkingType[];
};

// État de l'éditeur de personnalisation
export type CustomizerState = {
  productId: string;
  productName: string;
  productImage: string;
  selectedSize: string;
  selectedColor: string;
  markingType: MarkingType;
  activeSide: Side;
  customizations: Customization[];
  selectedCustomizationIndex: number | null;
};
