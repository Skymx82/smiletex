'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import TechniqueModal from './TechniqueModal';

// Données détaillées pour chaque technique
const techniquesData = [
  {
    id: 'dtf',
    title: 'Le transfert DTF',
    image: '/images/dtf.jpg',
    description: 'Technologie innovante pour des impressions textiles de haute qualité.',
    details: 'Le transfert DTF (Direct to Film) est une méthode d\'impression qui consiste à imprimer votre design sur un film spécial, puis à le transférer sur le textile à l\'aide d\'une poudre adhésive et d\'une presse à chaud.',
    advantages: [
      'Couleurs éclatantes et détails précis',
      'Durabilité exceptionnelle au lavage',
      'Compatible avec presque tous types de textiles',
      'Idéal pour les petites et moyennes séries'
    ],
    useCases: [
      'T-shirts personnalisés avec designs complexes',
      'Vêtements de sport et techniques',
      'Textiles foncés nécessitant des couleurs vives',
      'Designs avec dégradés et détails fins'
    ]
  },
  {
    id: 'dtg',
    title: 'L\'impression DTG',
    image: '/images/dtg.png',
    description: 'Impressions détaillées directement sur les vêtements.',
    details: 'L\'impression DTG (Direct to Garment) utilise une imprimante spécialisée pour appliquer l\'encre directement sur le textile, comme une imprimante classique sur du papier, mais adaptée aux tissus.',
    advantages: [
      'Reproduction fidèle des photos et illustrations',
      'Pas de limite de couleurs',
      'Toucher doux et respirant',
      'Idéal pour les pièces uniques ou petites séries'
    ],
    useCases: [
      'Reproductions d\'œuvres d\'art sur textile',
      'T-shirts avec photos ou designs photoréalistes',
      'Prototypes et échantillons',
      'Vêtements personnalisés à l\'unité'
    ]
  },
  {
    id: 'broderie',
    title: 'La broderie',
    image: '/images/broderie.png',
    description: 'Élégance et durabilité pour vos textiles.',
    details: 'La broderie consiste à créer un motif en cousant des fils colorés directement dans le tissu. Cette technique traditionnelle apporte une finition premium et professionnelle à vos textiles.',
    advantages: [
      'Aspect luxueux et professionnel',
      'Extrêmement durable dans le temps',
      'Résistante aux lavages intensifs',
      'Relief et texture uniques'
    ],
    useCases: [
      'Logos d\'entreprise sur polos et chemises',
      'Vêtements de travail et uniformes',
      'Articles promotionnels haut de gamme',
      'Casquettes et accessoires textiles'
    ]
  },
  {
    id: 'flocage',
    title: 'Le flocage',
    image: '/images/flocage.jpg',
    description: 'Texture veloutée et en relief pour des designs distinctifs.',
    details: 'Le flocage est une technique qui consiste à appliquer de fines particules de fibres synthétiques sur un adhésif préalablement imprimé sur le textile, créant ainsi un effet velouté au toucher.',
    advantages: [
      'Texture unique et toucher agréable',
      'Effet premium et distinctif',
      'Bonne durabilité',
      'Excellent rendu sur les designs simples'
    ],
    useCases: [
      'Vêtements de sport avec numéros et noms',
      'T-shirts avec logos et slogans',
      'Textiles promotionnels',
      'Designs minimalistes nécessitant un impact visuel fort'
    ]
  }
];

export default function TechniquesMarquage() {
  const [selectedTechnique, setSelectedTechnique] = useState<typeof techniquesData[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (technique: typeof techniquesData[0]) => {
    setSelectedTechnique(technique);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <section className="py-16 md:py-24 text-black">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Nos techniques de marquage</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Découvrez nos différentes techniques pour personnaliser vos textiles. Cliquez pour plus de détails.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {techniquesData.map((technique) => (
            <div 
              key={technique.id} 
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer"
              onClick={() => openModal(technique)}
            >
              <div className="relative h-48 mb-4 overflow-hidden rounded-lg">
                <Image
                  src={technique.image}
                  alt={technique.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">{technique.title}</h3>
              <p className="text-gray-700">{technique.description}</p>
              <p className="text-indigo-600 mt-3 font-medium">En savoir plus →</p>
            </div>
          ))}
        </div>
      </div>

      {selectedTechnique && (
        <TechniqueModal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          technique={selectedTechnique} 
        />
      )}
    </section>
  );
}
