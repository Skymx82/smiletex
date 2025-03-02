import { ProductCustomization } from '@/types/customization';

/**
 * Calcule le prix supplémentaire pour une personnalisation
 * @param customization - L'objet de personnalisation du produit
 * @returns Le prix supplémentaire en euros
 */
export function calculateCustomizationPrice(customization: ProductCustomization): number {
  let additionalPrice = 0;
  
  // Prix de base selon le type de marquage
  if (customization.markingType === 'impression') {
    additionalPrice += 5; // 5€ pour l'impression
  } else if (customization.markingType === 'broderie') {
    additionalPrice += 10; // 10€ pour la broderie
  }
  
  // Prix supplémentaire pour chaque élément de personnalisation
  customization.customizations.forEach(item => {
    if (item.type === 'text') {
      // Le prix du texte dépend de la longueur
      const textLength = item.content.length;
      if (textLength <= 10) {
        additionalPrice += 2;
      } else if (textLength <= 20) {
        additionalPrice += 3;
      } else {
        additionalPrice += 5;
      }
    } else if (item.type === 'image') {
      // Prix fixe pour une image
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
  const elements: string[] = [];
  
  // Type de marquage
  elements.push(`${customization.markingType === 'impression' ? 'Impression' : 'Broderie'}`);
  
  // Nombre d'éléments de texte
  const textElements = customization.customizations.filter(item => item.type === 'text');
  if (textElements.length > 0) {
    elements.push(`${textElements.length} texte(s)`);
  }
  
  // Nombre d'images
  const imageElements = customization.customizations.filter(item => item.type === 'image');
  if (imageElements.length > 0) {
    elements.push(`${imageElements.length} image(s)`);
  }
  
  // Côtés personnalisés
  const sides = new Set(customization.customizations.map(item => item.side));
  if (sides.has('front') && sides.has('back')) {
    elements.push('avant et arrière');
  } else if (sides.has('front')) {
    elements.push('avant uniquement');
  } else if (sides.has('back')) {
    elements.push('arrière uniquement');
  }
  
  return elements.join(', ');
}
