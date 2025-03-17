/**
 * Interface pour la personnalisation simplifiée utilisée dans l'application
 */
export interface SimpleProductCustomization {
  type_impression: string;
  position: string;
  texte?: string;
  couleur_texte?: string;
  police?: string;
  image_url?: string;
  type: 'text' | 'image'; // Type de personnalisation (texte ou image)
}

/**
 * Calcule le prix supplémentaire pour une personnalisation
 * @param customization - L'objet de personnalisation du produit
 * @returns Le prix supplémentaire en euros
 */
export function calculateCustomizationPrice(customization: SimpleProductCustomization): number {
  let additionalPrice = 0;
  
  // Prix de base selon le type de marquage
  if (customization.type_impression === 'broderie') {
    additionalPrice += 10; // 10€ pour la broderie
  } else if (customization.type_impression === 'flocage') {
    additionalPrice += 5; // 5€ pour le flocage
  }
  
  // Prix supplémentaire pour le texte
  if (customization.texte) {
    const textLength = customization.texte.length;
    if (textLength <= 10) {
      additionalPrice += 2;
    } else if (textLength <= 20) {
      additionalPrice += 3;
    } else {
      additionalPrice += 5;
    }
  }
  
  // Prix supplémentaire pour l'image
  if (customization.image_url) {
    additionalPrice += 7;
  }
  
  return additionalPrice;
}

/**
 * Génère une description de la personnalisation pour l'affichage
 * @param customization - L'objet de personnalisation du produit
 * @returns Une description textuelle de la personnalisation
 */
export function getCustomizationDescription(customization: SimpleProductCustomization): string {
  const elements: string[] = [];
  
  // Type d'impression
  elements.push(customization.type_impression === 'broderie' ? 'Broderie' : 'Flocage');
  
  // Position
  elements.push(`Position: ${customization.position}`);
  
  // Texte ou image
  if (customization.texte) {
    elements.push(`Texte: "${customization.texte}"`);
    elements.push(`Couleur: ${customization.couleur_texte}`);
    elements.push(`Police: ${customization.police}`);
  } else if (customization.image_url) {
    elements.push('Image personnalisée');
  }
  
  return elements.join(', ');
}
