import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Personnalisation de vêtements à Lyon | Smiletex - Expert en textile personnalisé',
  description: 'Smiletex, votre spécialiste de la personnalisation de vêtements à Lyon. Impression textile, flocage, broderie pour entreprises et particuliers. Devis gratuit et livraison rapide.',
  keywords: 'personnalisation vêtements lyon, impression textile lyon, flocage vêtements lyon, broderie lyon, t-shirts personnalisés lyon, vêtements professionnels lyon, textile personnalisé rhône-alpes',
  alternates: {
    canonical: '/personnalisation-vetements-lyon',
  },
};

export default function PersonnalisationVetementsLyon() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <section className="mb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Personnalisation de vêtements à Lyon
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Smiletex, votre expert local en impression textile et personnalisation de vêtements à Lyon et dans toute la région Rhône-Alpes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">
              Votre partenaire de confiance à Lyon pour tous vos projets textiles
            </h2>
            <p className="text-gray-600 mb-4">
              Depuis notre atelier lyonnais, nous proposons des services complets de personnalisation textile pour les particuliers et les professionnels. Notre expertise locale nous permet de vous offrir un service de proximité et des délais rapides.
            </p>
            <p className="text-gray-600 mb-4">
              Que vous soyez une entreprise à la recherche de vêtements corporatifs, une association sportive nécessitant des équipements personnalisés, ou un particulier souhaitant créer des pièces uniques, notre équipe lyonnaise est là pour vous accompagner.
            </p>
            <div className="mt-8">
              <Link 
                href="/devis" 
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors"
              >
                Demander un devis gratuit
              </Link>
            </div>
          </div>
          <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
            <Image 
              src="/images/lyon.avif" 
              alt="Atelier de personnalisation textile à Lyon" 
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-lg"
            />
          </div>
        </div>
      </section>

      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            Nos services de personnalisation à Lyon
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Découvrez notre gamme complète de services d'impression et de personnalisation textile disponibles à Lyon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="h-48 mb-4 relative rounded-md overflow-hidden">
              <Image 
                src="/images/dtg.png" 
                alt="Impression numérique directe (DTG) à Lyon" 
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Impression numérique (DTG)</h3>
            <p className="text-gray-600">
              Notre technologie d'impression directe sur textile permet des impressions haute définition, parfaites pour les designs complexes et photos. Idéal pour les petites et moyennes séries à Lyon.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="h-48 mb-4 relative rounded-md overflow-hidden">
              <Image 
                src="/images/flocage.jpg" 
                alt="Flocage textile à Lyon" 
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Flocage textile</h3>
            <p className="text-gray-600">
              Notre service de flocage à Lyon offre un rendu velours de qualité supérieure, durable et résistant aux lavages. Parfait pour les vêtements de sport et professionnels.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="h-48 mb-4 relative rounded-md overflow-hidden">
              <Image 
                src="/images/broderie.png" 
                alt="Broderie personnalisée à Lyon" 
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Broderie personnalisée</h3>
            <p className="text-gray-600">
              Notre atelier lyonnais propose un service de broderie haut de gamme pour une finition élégante et durable. Idéal pour les logos d'entreprise et les vêtements professionnels.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <div className="bg-indigo-50 p-8 rounded-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Pourquoi choisir Smiletex à Lyon ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-indigo-600 rounded-full p-2 mr-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Expertise locale</h3>
                <p className="text-gray-600">
                  Notre équipe lyonnaise connaît parfaitement les besoins des entreprises et particuliers de la région. Nous vous offrons un service personnalisé et de proximité.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 bg-indigo-600 rounded-full p-2 mr-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Qualité supérieure</h3>
                <p className="text-gray-600">
                  Nous utilisons uniquement des équipements de dernière génération et des matériaux de haute qualité pour garantir des résultats exceptionnels et durables.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 bg-indigo-600 rounded-full p-2 mr-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Délais rapides</h3>
                <p className="text-gray-600">
                  Notre production locale à Lyon nous permet de vous proposer des délais de livraison parmi les plus courts du marché, même pour les commandes urgentes.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 bg-indigo-600 rounded-full p-2 mr-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Service client exceptionnel</h3>
                <p className="text-gray-600">
                  Notre équipe lyonnaise vous accompagne à chaque étape de votre projet, du conseil initial à la livraison finale, pour une expérience client irréprochable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            Nos clients à Lyon et dans la région Rhône-Alpes
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Nous travaillons avec de nombreuses entreprises, associations et particuliers à Lyon et dans toute la région.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Entreprises lyonnaises</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Vêtements corporatifs et uniformes
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Cadeaux d'entreprise personnalisés
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Goodies et objets promotionnels
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Équipements pour événements et salons
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Associations et clubs lyonnais</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Équipements sportifs personnalisés
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                T-shirts pour événements et manifestations
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Vêtements pour écoles et universités
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Accessoires textiles personnalisés
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            Contactez-nous à Lyon
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Notre équipe lyonnaise est à votre disposition pour répondre à toutes vos questions et vous accompagner dans votre projet de personnalisation textile.
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Nos coordonnées à Lyon</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-indigo-600 mr-3">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Adresse</p>
                    <p className="text-gray-600">123 Rue de Lyon, 69000 Lyon</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 text-indigo-600 mr-3">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Téléphone</p>
                    <p className="text-gray-600">04 XX XX XX XX</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 text-indigo-600 mr-3">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">contact@smiletex.fr</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 text-indigo-600 mr-3">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Horaires d'ouverture</p>
                    <p className="text-gray-600">Lundi au Vendredi: 9h - 18h</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link 
                  href="/devis" 
                  className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors"
                >
                  Demander un devis gratuit
                </Link>
              </div>
            </div>

            <div className="h-64 md:h-auto relative rounded-lg overflow-hidden">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d44543.96964336747!2d4.8013899!3d45.7579555!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47f4ea516ae88797%3A0x408ab2ae4bb21f0!2sLyon!5e0!3m2!1sfr!2sfr!4v1617289623599!5m2!1sfr!2sfr" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy"
                className="absolute inset-0"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            Zones desservies autour de Lyon
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Nous intervenons à Lyon et dans toute la région Rhône-Alpes pour vos projets de personnalisation textile.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Lyon et métropole</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Lyon 1er</li>
                <li>Lyon 2ème</li>
                <li>Lyon 3ème</li>
                <li>Lyon 4ème</li>
                <li>Lyon 5ème</li>
                <li>Lyon 6ème</li>
                <li>Lyon 7ème</li>
                <li>Lyon 8ème</li>
                <li>Lyon 9ème</li>
                <li>Villeurbanne</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Est lyonnais</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Bron</li>
                <li>Vaulx-en-Velin</li>
                <li>Décines-Charpieu</li>
                <li>Meyzieu</li>
                <li>Saint-Priest</li>
                <li>Chassieu</li>
                <li>Genas</li>
                <li>Mions</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Ouest lyonnais</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Tassin-la-Demi-Lune</li>
                <li>Écully</li>
                <li>Dardilly</li>
                <li>Charbonnières-les-Bains</li>
                <li>Craponne</li>
                <li>Francheville</li>
                <li>Sainte-Foy-lès-Lyon</li>
                <li>Oullins</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Région Rhône-Alpes</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Saint-Étienne</li>
                <li>Grenoble</li>
                <li>Valence</li>
                <li>Chambéry</li>
                <li>Annecy</li>
                <li>Bourg-en-Bresse</li>
                <li>Vienne</li>
                <li>Roanne</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
