import { ProductCustomization, SingleCustomization } from '@/types/customization';

/**
 * Export du type ProductCustomization pour la rétro-compatibilité
 * Cette ligne permet de maintenir la compatibilité avec le code existant
 */
export type SimpleProductCustomization = ProductCustomization;

/**
 * Calcule le prix supplémentaire pour une personnalisation
 * @param customization - L'objet de personnalisation du produit
 * @returns Le prix supplémentaire en euros
 */
export function calculateCustomizationPrice(customization: ProductCustomization): number {
  let additionalPrice = 0;
  
  // Calcul du prix pour chaque personnalisation individuelle
  if (!customization.customizations || customization.customizations.length === 0) {
    return 0;
  }
  
  // Additionner le prix de chaque personnalisation
  customization.customizations.forEach(singleCustomization => {
    // Prix de base selon le type de marquage
    if (singleCustomization.type_impression === 'broderie') {
      additionalPrice += 10; // 10€ pour la broderie
    } else if (singleCustomization.type_impression === 'flocage') {
      additionalPrice += 5; // 5€ pour le flocage
    }
    
    // Prix supplémentaire pour le texte
    if (singleCustomization.texte) {
      const textLength = singleCustomization.texte.length;
      if (textLength <= 10) {
        additionalPrice += 2;
      } else if (textLength <= 20) {
        additionalPrice += 3;
      } else {
        additionalPrice += 5;
      }
    }
    
    // Prix supplémentaire pour l'image
    if (singleCustomization.image_url) {
      additionalPrice += 7;
    }
  });
  
  return additionalPrice;
}

/**
 * Génère une description de la personnalisation pour l'affichage
 * @param customization - L'objet de personnalisation du produit
 * @returns Une description textuelle de la personnalisation
 */
/**
 * Vérifie si une personnalisation individuelle est complète
 * @param customization - L'objet de personnalisation individuelle
 * @returns true si la personnalisation est complète, false sinon
 */
export function isSingleCustomizationComplete(customization: SingleCustomization): boolean {
  // Une personnalisation est complète si elle a un type d'impression, une position,
  // et soit un texte (pour le type 'text') soit une image (pour le type 'image')
  if (!customization.type_impression || !customization.position) {
    return false;
  }
  
  if (customization.type === 'text' && !customization.texte) {
    return false;
  }
  
  if (customization.type === 'image' && !customization.image_url) {
    return false;
  }
  
  return true;
}

/**
 * Vérifie si une personnalisation de produit est complète
 * @param customization - L'objet de personnalisation du produit
 * @returns true si au moins une personnalisation est complète, false sinon
 */
export function isCustomizationComplete(customization: ProductCustomization): boolean {
  if (!customization.customizations || customization.customizations.length === 0) {
    return false;
  }
  
  // Une personnalisation de produit est complète si au moins une de ses personnalisations individuelles est complète
  return customization.customizations.some(singleCustomization => isSingleCustomizationComplete(singleCustomization));
}

export function getCustomizationDescription(customization: ProductCustomization): string {
  if (!customization.customizations || customization.customizations.length === 0) {
    return 'Aucune personnalisation';
  }
  
  // Générer une description pour chaque personnalisation
  const descriptions = customization.customizations.map(singleCustomization => {
    const elements: string[] = [];
    
    // Face (devant/derrière)
    elements.push(singleCustomization.face === 'devant' ? 'Devant' : 'Derrière');
    
    // Type d'impression
    elements.push(singleCustomization.type_impression === 'broderie' ? 'Broderie' : 'Flocage');
    
    // Position
    elements.push(`Position: ${singleCustomization.position}`);
    
    // Texte ou image
    if (singleCustomization.texte) {
      elements.push(`Texte: "${singleCustomization.texte}"`);
      elements.push(`Couleur: ${singleCustomization.couleur_texte}`);
      elements.push(`Police: ${singleCustomization.police}`);
    } else if (singleCustomization.image_url) {
      elements.push('Image personnalisée');
    }
    
    return elements.join(', ');
  });
  
  return descriptions.join(' | ');
}
