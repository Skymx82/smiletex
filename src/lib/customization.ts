import { ProductCustomization } from '@/types/customization';

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
