'use client';

import Link from 'next/link';
import Image from 'next/image';

// Composant pour les courbes souriantes
const SmileCurve = ({ className, color = "text-white", rotate = false }: { className: string; color?: string; rotate?: boolean }) => (
  <svg 
    viewBox="0 0 1200 120" 
    preserveAspectRatio="none" 
    className={`${className} ${color} ${rotate ? 'transform rotate-180' : ''}`}
  >
    <path 
      d="M0,120 L1200,120 L1200,60 C1000,100 800,120 600,80 C400,40 200,60 0,80 L0,120 Z" 
      fill="currentColor" 
    />
  </svg>
);

export default function AboutPage() {
  return (
    <div className="bg-gray-50">
      {/* Section Hero */}
      <section className="relative bg-indigo-800 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/lyon.avif"
            alt="Atelier smiletex"
            fill 
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-indigo-700 to-indigo-600 opacity-60"></div>
          {/* Éléments graphiques abstraits */}
          <div className="absolute right-0 top-1/4 w-64 h-64 rounded-full bg-[#FCEB14] opacity-10 blur-3xl"></div>
          <div className="absolute left-1/4 bottom-1/3 w-48 h-48 rounded-full bg-indigo-300 opacity-20 blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="relative inline-block">
                Notre Histoire
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-[#FCEB14] rounded-full"></span>
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-indigo-100">
              Découvrez l'histoire et les valeurs qui font de Smiletex votre partenaire de confiance.
            </p>
          </div>
        </div>
        {/* Courbe souriante en bas du hero */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <SmileCurve className="w-full h-16" />
        </div>
      </section>

      {/* Section Histoire */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        {/* Éléments graphiques abstraits */}
        <div className="absolute left-1/4 top-1/3 w-64 h-64 rounded-full bg-[#FCEB14] opacity-5 blur-3xl"></div>
        <div className="absolute right-1/3 bottom-1/4 w-72 h-72 rounded-full bg-indigo-200 opacity-10 blur-3xl"></div>
        
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            <span className="relative inline-block">
              Notre
            </span>
            <span className="ml-2 relative inline-block text-indigo-600">
              Histoire
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#FCEB14] rounded-full"></span>
            </span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <p className="text-lg text-gray-700">
              Fondée en 2020, smiletex est née d'une passion pour la personnalisation textile et d'une vision entrepreneuriale axée sur la qualité et l'innovation.
            </p>
            <p className="text-lg text-gray-700">
              Ce qui a débuté comme une petite entreprise s'est rapidement développé grâce à un engagement constant envers l'excellence et la satisfaction client. En 2021, l'entreprise a connu un tournant décisif avec l'expansion de ses services et techniques de personnalisation.
            </p>
            <p className="text-lg text-gray-700">
              En 2024, smiletex a franchi une nouvelle étape en se consacrant entièrement à l'art de la personnalisation textile, consolidant sa position sur le marché comme un acteur innovant alliant expertise technique et créativité sans limites.
            </p>
            <div className="mt-8 h-1 w-24 bg-[#FCEB14] rounded-full"></div>
          </div>
          <div className="relative h-96 rounded-xl overflow-hidden shadow-lg group transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-200/50">
            <Image
              src="/images/atelier.jpg"
              alt="Atelier smiletex"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
      </div>

      {/* Section Valeurs */}
      <section className="py-16 md:py-24 bg-indigo-50 relative overflow-hidden">
        {/* Éléments graphiques abstraits évoquant le sourire */}
        <div className="absolute left-0 top-0 w-64 h-64 rounded-full bg-[#FCEB14] opacity-5 blur-3xl"></div>
        <div className="absolute right-0 bottom-0 w-72 h-72 rounded-full bg-indigo-300 opacity-10 blur-3xl"></div>
        <div className="absolute left-1/4 right-1/4 bottom-1/3 h-32 border-b-8 border-[#FCEB14] opacity-5 rounded-b-full"></div>
        
        {/* Courbe souriante en haut de la section */}
        <div className="absolute top-0 left-0 right-0 overflow-hidden">
          <SmileCurve className="w-full h-16" color="text-white" rotate={true} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <span className="relative inline-block">
                Nos
              </span>
              <span className="relative inline-block text-indigo-600 ml-2">
                Valeurs
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#FCEB14] rounded-full"></span>
              </span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Ligne courbe évoquant un sourire */}
            <div className="absolute -top-8 left-1/4 right-1/4 h-16 border-t-4 border-[#FCEB14] opacity-10 rounded-t-full"></div>
            
            <div className="bg-white p-8 rounded-xl shadow-md text-center transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:shadow-indigo-200/50 group">
              <div className="bg-indigo-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-[#FCEB14]/20 relative overflow-hidden">
                <div className="absolute w-full h-3 bg-[#FCEB14]/20 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-indigo-600 mb-4 transition-colors duration-300 group-hover:text-indigo-700">Expertise</h3>
              <p className="text-gray-700">
                Notre expérience dans le domaine nous permet de vous garantir un travail de qualité, réalisé avec des techniques maîtrisées et un souci du détail constant.
              </p>
              <div className="mt-4 h-1 w-12 bg-[#FCEB14] mx-auto rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:w-24"></div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md text-center transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:shadow-indigo-200/50 group">
              <div className="bg-indigo-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-[#FCEB14]/20 relative overflow-hidden">
                <div className="absolute w-full h-3 bg-[#FCEB14]/20 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-indigo-600 mb-4 transition-colors duration-300 group-hover:text-indigo-700">Personnalisation</h3>
              <p className="text-gray-700">
                Chaque projet est unique. Nous prenons le temps d'écouter vos besoins pour vous proposer la solution la plus adaptée à vos envies.
              </p>
              <div className="mt-4 h-1 w-12 bg-[#FCEB14] mx-auto rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:w-24"></div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md text-center transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:shadow-indigo-200/50 group">
              <div className="bg-indigo-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-[#FCEB14]/20 relative overflow-hidden">
                <div className="absolute w-full h-3 bg-[#FCEB14]/20 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-indigo-600 mb-4 transition-colors duration-300 group-hover:text-indigo-700">Engagement</h3>
              <p className="text-gray-700">
                Nous nous engageons à vous offrir un service de qualité, des délais respectés et un accompagnement personnalisé tout au long de votre projet.
              </p>
              <div className="mt-4 h-1 w-12 bg-[#FCEB14] mx-auto rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:w-24"></div>
            </div>
          </div>
        </div>
        
        {/* Courbe souriante en bas de la section */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <SmileCurve className="w-full h-16" color="text-white" />
        </div>
      </section>

      {/* Section Mission */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        {/* Éléments graphiques abstraits */}
        <div className="absolute right-1/4 top-1/3 w-56 h-56 rounded-full bg-[#FCEB14] opacity-5 blur-3xl"></div>
        <div className="absolute left-1/3 bottom-1/4 w-64 h-64 rounded-full bg-indigo-200 opacity-10 blur-3xl"></div>
        
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            <span className="relative inline-block">
              Notre
            </span>
            <span className="relative inline-block text-indigo-600 ml-2">
              Mission
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#FCEB14] rounded-full"></span>
            </span>
          </h2>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-md relative overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:shadow-indigo-200/50 group">
          {/* Forme abstraite de sourire */}
          <div className="absolute -right-12 -top-12 w-24 h-24 rounded-full border-8 border-[#FCEB14]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <p className="text-lg text-gray-700 relative">
            <span className="absolute -left-2 top-0 text-4xl text-indigo-200 opacity-50">"</span>
            <span className="relative ml-6">smiletex est bien plus qu'une entreprise de personnalisation textile. Notre mission est de transformer vos idées en créations uniques qui reflètent votre identité, tout en respectant des valeurs d'excellence, d'innovation et de durabilité.</span>
          </p>
          <p className="text-lg text-gray-700 mt-4 ml-6">
            Nous nous engageons à fournir des produits de haute qualité, réalisés avec des matériaux soigneusement sélectionnés et des techniques de pointe, pour garantir des résultats qui dépassent vos attentes.
          </p>
          
          {/* Indicateur de sourire subtil */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FCEB14] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>

      {/* Section Techniques de marquage */}
      <section className="py-16 md:py-24 bg-indigo-50 relative overflow-hidden">
        {/* Éléments graphiques abstraits */}
        <div className="absolute left-0 top-1/3 w-64 h-64 rounded-full bg-[#FCEB14] opacity-5 blur-3xl"></div>
        <div className="absolute right-0 bottom-1/4 w-72 h-72 rounded-full bg-indigo-200 opacity-10 blur-3xl"></div>
        
        {/* Courbe souriante en haut de la section */}
        <div className="absolute top-0 left-0 right-0 overflow-hidden">
          <SmileCurve className="w-full h-16" color="text-white" rotate={true} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <span className="relative inline-block">
                Nos techniques de
              </span>
              <span className="relative inline-block text-indigo-600 ml-2">
                marquage
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#FCEB14] rounded-full"></span>
              </span>
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Nous maîtrisons un ensemble de techniques de marquage pour répondre à tous vos besoins, afin de nous permettre d'offrir une personnalisation adaptée à chaque projet.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:shadow-indigo-200/50 group">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src="/images/dtf.jpg"
                  alt="Transfert DTF"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-0 right-0 bg-[#FCEB14] text-indigo-800 font-bold py-1 px-3 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Populaire
                </div>
              </div>
              <div className="p-6 relative">
                <h3 className="text-xl font-bold text-indigo-600 mb-2 transition-colors duration-300 group-hover:text-indigo-700">Le transfert DTF</h3>
                <p className="text-gray-700">
                  Le transfert DTF est une technologie innovante, permettant des impressions textiles de haute qualité. Elle offre des couleurs éclatantes, des détails précis et une durabilité exceptionnelle.
                </p>
                <div className="mt-4 h-0.5 w-12 bg-[#FCEB14] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:w-24"></div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:shadow-indigo-200/50 group">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src="/images/dtg.png"
                  alt="Impression DTG"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6 relative">
                <h3 className="text-xl font-bold text-indigo-600 mb-2 transition-colors duration-300 group-hover:text-indigo-700">L'impression DTG</h3>
                <p className="text-gray-700">
                  L'impression DTG réalise des impressions détaillées directement sur les vêtements, offrant des résultats précis et durables pour des designs personnalisés.
                </p>
                <div className="mt-4 h-0.5 w-12 bg-[#FCEB14] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:w-24"></div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:shadow-indigo-200/50 group">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src="/images/broderie.png"
                  alt="Broderie"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6 relative">
                <h3 className="text-xl font-bold text-indigo-600 mb-2 transition-colors duration-300 group-hover:text-indigo-700">La broderie</h3>
                <p className="text-gray-700">
                  La broderie ajoute une touche élégante et durable à vos textiles avec des motifs détaillés en fils de haute qualité.
                </p>
                <div className="mt-4 h-0.5 w-12 bg-[#FCEB14] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:w-24"></div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:shadow-indigo-200/50 group">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src="/images/flocage.jpg"
                  alt="Flocage"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6 relative">
                <h3 className="text-xl font-bold text-indigo-600 mb-2 transition-colors duration-300 group-hover:text-indigo-700">Le flocage</h3>
                <p className="text-gray-700">
                  Le flocage offre une texture veloutée et en relief, parfaite pour des designs audacieux et distinctifs.
                </p>
                <div className="mt-4 h-0.5 w-12 bg-[#FCEB14] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:w-24"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Courbe souriante en bas de la section */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <SmileCurve className="w-full h-16" color="text-white" />
        </div>
      </section>

      {/* Section Expertise */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        {/* Éléments graphiques abstraits */}
        <div className="absolute left-1/4 top-1/3 w-64 h-64 rounded-full bg-[#FCEB14] opacity-5 blur-3xl"></div>
        <div className="absolute right-1/3 bottom-1/4 w-72 h-72 rounded-full bg-indigo-200 opacity-10 blur-3xl"></div>
        
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            <span className="relative inline-block">
              Notre
            </span>
            <span className="relative inline-block text-indigo-600 ml-2">
              Expertise
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#FCEB14] rounded-full"></span>
            </span>
          </h2>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-md relative overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:shadow-indigo-200/50 group">
          {/* Forme abstraite de sourire */}
          <div className="absolute -right-12 -top-12 w-24 h-24 rounded-full border-8 border-[#FCEB14]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute left-1/4 right-1/4 bottom-1/3 h-16 border-b-4 border-[#FCEB14] opacity-5 rounded-b-full"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-lg text-gray-700">
                Avec plusieurs années d'expérience dans le domaine de la personnalisation textile, notre équipe maîtrise les techniques les plus avancées pour garantir des résultats d'exception.
              </p>
              <p className="text-lg text-gray-700 mt-4">
                Nous travaillons avec des entreprises de toutes tailles, des associations et des particuliers pour créer des produits personnalisés qui répondent précisément à leurs besoins et exigences.
              </p>
              <div className="mt-6 h-1 w-16 bg-[#FCEB14] rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:w-32"></div>
            </div>
            <div>
              <p className="text-lg text-gray-700">
                Notre processus de production rigoureux et notre contrôle qualité systématique nous permettent d'offrir des produits durables qui conservent leur éclat et leur qualité au fil du temps.
              </p>
              <p className="text-lg text-gray-700 mt-4">
                Nous investissons continuellement dans les dernières technologies et formations pour rester à la pointe de l'innovation dans notre secteur.
              </p>
              <div className="mt-6 h-1 w-16 bg-[#FCEB14] rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:w-32"></div>
            </div>
          </div>
          
          {/* Indicateur de sourire subtil */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FCEB14] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>

      {/* Section CTA */}
      <section className="py-16 md:py-24 bg-indigo-50 relative overflow-hidden">
        {/* Éléments graphiques abstraits */}
        <div className="absolute left-0 top-1/4 w-72 h-72 rounded-full bg-[#FCEB14] opacity-5 blur-3xl"></div>
        <div className="absolute right-0 bottom-1/4 w-64 h-64 rounded-full bg-indigo-200 opacity-10 blur-3xl"></div>
        
        {/* Courbe souriante en haut de la section */}
        <div className="absolute top-0 left-0 right-0 overflow-hidden">
          <SmileCurve className="w-full h-16" color="text-white" rotate={true} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            <span className="relative inline-block">
              Découvrez l'Excellence
            </span>
            <span className="relative inline-block text-indigo-600 ml-2">
              smiletex
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#FCEB14] rounded-full"></span>
            </span>
          </h2>
          
          <Link 
            href="/products" 
            className="inline-block bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-4 px-8 rounded-xl text-lg shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
          >
            <span className="relative z-10">
              Explorer notre collection
            </span>
            <span className="absolute bottom-0 left-0 w-full h-1 bg-[#FCEB14] transform transition-transform duration-300 ease-out translate-y-full group-hover:translate-y-0"></span>
          </Link>
        </div>
      </section>
    </div>
  );
}