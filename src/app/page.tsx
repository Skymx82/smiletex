'use client';

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import BrandsMarquee from "@/components/BrandsMarquee";
import { useFeaturedProducts } from "@/hooks/useProducts";
import TrustBadge from "@/components/TrustBadge";
import TechniquesMarquage from "@/components/TechniquesMarquage";

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

// Composant pour le formulaire de devis urgent
function UrgentQuoteForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    projectType: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({...formData, urgent: true}),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }

      setSubmitStatus('success');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        projectType: '',
        message: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            Prénom<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            required
            placeholder="Votre prénom"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Nom<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            required
            placeholder="Votre nom"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email<span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="Votre adresse email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Téléphone<span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            placeholder="Votre numéro de téléphone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
          />
        </div>
      </div>

      <div>
        <label htmlFor="projectType" className="block text-sm font-medium text-gray-700">
          Type de projet<span className="text-red-500">*</span>
        </label>
        <select
          id="projectType"
          name="projectType"
          required
          value={formData.projectType}
          onChange={(e) => setFormData(prev => ({ ...prev, projectType: e.target.value }))}
          className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-[#FCEB14] p-2 border transition-all duration-300"
        >
          <option value="">Choisir</option>
          <option value="entreprise">Entreprise</option>
          <option value="association">Association</option>
          <option value="collectivite">Collectivité</option>
          <option value="marque">Marque</option>
          <option value="particulier">Particulier</option>
          <option value="autre">Autre</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          Détails de votre projet<span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          placeholder="Décrivez votre projet, quantités, délais souhaités..."
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-[#FCEB14] p-2 border transition-all duration-300"
        ></textarea>
      </div>

      <div className="flex items-center">
        <div className="flex-shrink-0 mr-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FCEB14]/30 to-indigo-100 rounded-full flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <p className="text-sm text-indigo-700 font-medium flex items-center">
          <span>Devis express : </span>
          <span className="relative ml-1 font-bold">
            réponse garantie sous 24h
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#FCEB14] rounded-full"></span>
          </span>
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FCEB14] transition-all duration-300 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''} group relative overflow-hidden`}
      >
        <span className="relative z-10">{isSubmitting ? 'Envoi en cours...' : 'Demander un devis urgent'}</span>
        <span className="absolute bottom-0 left-0 w-full h-1 bg-[#FCEB14] transform transition-transform duration-300 ease-out translate-y-full group-hover:translate-y-0"></span>
      </button>

      {submitStatus === 'success' && (
        <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full bg-green-100/50"></div>
          <p className="text-green-800 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Votre demande a été envoyée avec succès ! Nous vous contacterons sous 24h.
          </p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full bg-red-100/50"></div>
          <p className="text-red-800 flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Une erreur est survenue. Veuillez réessayer ou nous contacter par téléphone.
          </p>
        </div>
      )}
    </form>
  );
}

export default function Home() {
  const { products: featuredProducts, loading, error } = useFeaturedProducts();

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-indigo-800 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <Image 
            src="/images/hero-bg.png" 
            alt="Fond Smiletex" 
            fill 
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-indigo-700 to-indigo-600 opacity-50"></div>
          {/* Éléments graphiques abstraits */}
          <div className="absolute right-0 top-1/4 w-64 h-64 rounded-full bg-[#FCEB14] opacity-10 blur-3xl"></div>
          <div className="absolute left-1/4 bottom-1/3 w-48 h-48 rounded-full bg-indigo-300 opacity-20 blur-3xl"></div>
        </div>
        <div className="relative max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Bienvenue chez <span className="relative inline-block">
                Smiletex
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-[#FCEB14] rounded-full"></span>
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-indigo-100">
              Découvrez notre collection de vêtements personnalisables et créez votre style unique.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/products" className="group relative overflow-hidden bg-white text-indigo-800 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:shadow-indigo-900/20 transition-all duration-300">
                Personnaliser en ligne
                <span className="absolute bottom-0 left-0 w-full h-1 bg-[#FCEB14] transform transition-transform duration-300 ease-out translate-y-full group-hover:translate-y-0"></span>
              </Link>
              <Link href="/devis" className="group relative overflow-hidden bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:border-[#FCEB14] hover:text-[#FCEB14] transition-all duration-300">
                Devis rapide 24h
                <span className="absolute bottom-0 left-0 w-full h-1 bg-[#FCEB14] transform transition-transform duration-300 ease-out translate-y-full group-hover:translate-y-0"></span>
              </Link>
            </div>
          </div>
        </div>
        {/* Courbe souriante en bas du hero */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <SmileCurve className="w-full h-16" />
        </div>
      </section>

      {/* Trust Badge */}
      <TrustBadge />

      {/* Featured Products */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Éléments graphiques abstraits */}
        {/* Formes abstraites évoquant le sourire */}
        <div className="absolute left-1/4 top-1/3 w-64 h-64 rounded-full bg-[#FCEB14] opacity-5 blur-3xl"></div>
        <div className="absolute right-1/3 bottom-1/4 w-72 h-72 rounded-full bg-indigo-200 opacity-10 blur-3xl"></div>
        <div className="absolute right-1/2 top-1/2 w-96 h-32 rounded-b-full border-b-8 border-[#FCEB14] opacity-5 transform rotate-6"></div>
        
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <span className="relative inline-block">
                Catégories de
              </span>
              <span className="ml-2 relative inline-block text-indigo-600">
                produits personnalisés
                <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
                  <path d="M0,6 C25,2 50,-1 75,2 C87,4 95,5 100,6 L0,6 Z" fill="#FCEB14" />
                </svg>
              </span>
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Découvrez notre sélection de vêtements les plus appréciés par nos clients.
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des produits...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              Une erreur est survenue lors du chargement des produits.
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              Aucun produit populaire n'est disponible pour le moment.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 min-w-max md:min-w-0 mt-8 relative">
                {/* Ligne courbe évoquant un sourire */}
                <div className="absolute -top-8 left-1/4 right-1/4 h-16 border-t-4 border-[#FCEB14] opacity-10 rounded-t-full"></div>
                {featuredProducts.map((product) => (
                  <div key={product.id} className="w-80 md:w-auto bg-white text-black rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex-shrink-0 group transform hover:-translate-y-1 hover:shadow-indigo-200/50">
                    <Link href={`/products/${product.id}`}>
                      <div className="relative h-64 overflow-hidden">
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 320px, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-0 right-0 bg-[#FCEB14] text-indigo-800 font-bold py-1 px-3 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Populaire
                        </div>
                      </div>
                    </Link>
                    <div className="p-4 relative">
                      {/* Forme abstraite de sourire */}
                      <div className="absolute -right-12 -bottom-12 w-24 h-24 rounded-tl-full border-8 border-[#FCEB14]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <Link href={`/products/${product.id}`}>
                        <h3 className="text-lg font-semibold mb-1 hover:text-indigo-600 transition-colors duration-300">{product.name}</h3>
                      </Link>
                      <p className="text-gray-600 mb-2">{product.description}</p>
                      <p className="text-indigo-600 font-bold">{product.base_price.toFixed(2)} €</p>
                      <Link href={`/products/${product.id}`}>
                        <button className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 relative overflow-hidden group-hover:shadow-md">
                          <span className="relative z-10">Voir le produit</span>
                          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FCEB14] transform transition-transform duration-300 ease-out translate-y-full group-hover:translate-y-0"></span>
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-center mt-12 relative">
            {/* Formes abstraites évoquant le sourire */}
            <div className="absolute left-1/3 -top-8 w-1/3 h-16 border-t-4 border-[#FCEB14] opacity-10 rounded-t-full"></div>
            
            <Link 
              href="/products" 
              className="inline-block bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3 px-8 rounded-xl text-lg shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10">
                Voir tous les produits
              </span>
              <span className="absolute bottom-0 left-0 w-full h-1 bg-[#FCEB14] transform transition-transform duration-300 ease-out translate-y-full group-hover:translate-y-0"></span>
            </Link>
          </div>
        </div>
      </section>

      {/* Marques partenaires */}
      <BrandsMarquee />

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-indigo-50 relative overflow-hidden">
        {/* Éléments graphiques abstraits évoquant le sourire */}
        <div className="absolute left-0 top-0 w-64 h-64 rounded-full bg-[#FCEB14] opacity-5 blur-3xl"></div>
        <div className="absolute right-0 bottom-0 w-72 h-72 rounded-full bg-indigo-300 opacity-10 blur-3xl"></div>
        <div className="absolute left-1/4 right-1/4 bottom-1/3 h-32 border-b-8 border-[#FCEB14] opacity-5 rounded-b-full"></div>
        <div className="absolute right-1/4 top-1/4 w-32 h-32 border-4 border-[#FCEB14] opacity-5 rounded-full"></div>
        
        {/* Courbe souriante en haut de la section */}
        <div className="absolute top-0 left-0 right-0 overflow-hidden">
          <SmileCurve className="w-full h-16" color="text-white" rotate={true} />
        </div>
        
        <div className="relative max-w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <span className="relative inline-block">
                Pourquoi choisir
              </span>
              <span className="relative inline-block text-indigo-600 ml-2">
                Smiletex
                <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
                  <path d="M0,6 C25,2 50,-1 75,2 C87,4 95,5 100,6 L0,6 Z" fill="#FCEB14" />
                </svg>
              </span>
              <span className="ml-1">?</span>
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Nous nous engageons à vous offrir une expérience d'achat exceptionnelle avec des produits de qualité.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Ligne courbe évoquant un sourire */}
            <div className="absolute -top-8 left-1/4 right-1/4 h-16 border-t-4 border-[#FCEB14] opacity-10 rounded-t-full"></div>
            <div className="bg-white p-8 rounded-xl shadow-md text-center transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:shadow-indigo-200/50 group">
              <div className="bg-indigo-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-[#FCEB14]/20 relative overflow-hidden">
                <div className="absolute w-full h-3 bg-[#FCEB14]/20 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-indigo-600 mb-4 transition-colors duration-300 group-hover:text-indigo-700">Qualité supérieure</h3>
              <p className="text-gray-700">
                Tous nos produits sont fabriqués avec des matériaux de haute qualité pour garantir confort et durabilité.
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
              <h3 className="text-xl font-bold text-indigo-600 mb-4 transition-colors duration-300 group-hover:text-indigo-700">Personnalisation unique</h3>
              <p className="text-gray-700">
                Créez des vêtements qui vous ressemblent avec nos options de personnalisation avancées.
              </p>
              <div className="mt-4 h-1 w-12 bg-[#FCEB14] mx-auto rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:w-24"></div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md text-center transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:shadow-indigo-200/50 group">
              <div className="bg-indigo-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-[#FCEB14]/20 relative overflow-hidden">
                <div className="absolute w-full h-3 bg-[#FCEB14]/20 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-indigo-600 mb-4 transition-colors duration-300 group-hover:text-indigo-700">Livraison rapide</h3>
              <p className="text-gray-700">
                Profitez de notre service de livraison rapide et sécurisé pour recevoir vos commandes en temps record.
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

      {/* Techniques de marquage Section */}
      <TechniquesMarquage />

      {/* Inspiration Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Éléments graphiques abstraits */}
        {/* Formes abstraites évoquant le sourire */}
        <div className="absolute left-0 top-1/3 w-64 h-64 rounded-full bg-[#FCEB14] opacity-5 blur-3xl"></div>
        <div className="absolute right-0 bottom-1/4 w-72 h-72 rounded-full bg-indigo-200 opacity-10 blur-3xl"></div>
        <div className="absolute left-1/4 right-1/4 top-1/3 h-32 border-b-8 border-[#FCEB14] opacity-5 rounded-b-full"></div>
        
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <span className="relative inline-block">
                Inspirez
              </span>
              <span className="relative inline-block text-indigo-600">
                -vous
                <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
                  <path d="M0,6 C25,2 50,-1 75,2 C87,4 95,5 100,6 L0,6 Z" fill="#FCEB14" />
                </svg>
              </span>
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Découvrez nos créations et laissez-vous inspirer pour votre prochain projet personnalisé.
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <div className="flex gap-4 md:grid md:grid-cols-2 lg:grid-cols-4 min-w-max md:min-w-0 relative">
              {/* Ligne courbe évoquant un sourire */}
              <div className="absolute -top-8 left-1/4 right-1/4 h-16 border-t-4 border-[#FCEB14] opacity-10 rounded-t-full"></div>
              <div className="w-72 md:w-auto relative aspect-square overflow-hidden rounded-xl shadow-lg group transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-200/50">
                <Image
                  src="/images/inspiration.jpg"
                  alt="Inspiration 1"
                  fill
                  sizes="(max-width: 640px) 288px, (max-width: 1024px) 50vw, 25vw"
                  quality={90}
                  priority
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-white font-medium">
                    T-shirts personnalisés
                  </span>
                </div>
                {/* Forme abstraite de sourire */}
                <div className="absolute -left-4 -top-4 w-16 h-16 rounded-br-full border-4 border-[#FCEB14] opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </div>
              <div className="w-72 md:w-auto relative aspect-square overflow-hidden rounded-xl shadow-lg group transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-200/50">
                <Image
                  src="/images/inspiration (1).jpg"
                  alt="Inspiration 2"
                  fill
                  sizes="(max-width: 640px) 288px, (max-width: 1024px) 50vw, 25vw"
                  quality={90}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-white font-medium">
                    Sweatshirts élégants
                  </span>
                </div>
                {/* Forme abstraite de sourire */}
                <div className="absolute -right-4 -top-4 w-16 h-16 rounded-bl-full border-4 border-[#FCEB14] opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </div>
              <div className="w-72 md:w-auto relative aspect-square overflow-hidden rounded-xl shadow-lg group transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-200/50">
                <Image
                  src="/images/inspiration (2).jpg"
                  alt="Inspiration 3"
                  fill
                  sizes="(max-width: 640px) 288px, (max-width: 1024px) 50vw, 25vw"
                  quality={90}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-white font-medium">
                    Accessoires tendance
                  </span>
                </div>
                {/* Forme abstraite de sourire */}
                <div className="absolute -left-4 -bottom-4 w-16 h-16 rounded-tr-full border-4 border-[#FCEB14] opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </div>
              <div className="w-72 md:w-auto relative aspect-square overflow-hidden rounded-xl shadow-lg group transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-200/50">
                <Image
                  src="/images/inspiration (3).jpg"
                  alt="Inspiration 4"
                  fill
                  sizes="(max-width: 640px) 288px, (max-width: 1024px) 50vw, 25vw"
                  quality={90}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-white font-medium">
                    Collections entreprise
                  </span>
                </div>
                {/* Forme abstraite de sourire */}
                <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-tl-full border-4 border-[#FCEB14] opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12 relative">
            {/* Formes abstraites évoquant le sourire */}
            <div className="absolute left-1/3 -top-8 w-1/3 h-16 border-t-4 border-[#FCEB14] opacity-10 rounded-t-full"></div>
            
            <Link 
              href="/inspiration" 
              className="inline-block bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3 px-8 rounded-xl text-lg shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10">
                Plus d'inspiration
              </span>
              <span className="absolute bottom-0 left-0 w-full h-1 bg-[#FCEB14] transform transition-transform duration-300 ease-out translate-y-full group-hover:translate-y-0"></span>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-8 md:py-24 relative overflow-hidden">
        {/* Éléments graphiques abstraits */}
        <div className="absolute right-1/4 top-1/3 w-56 h-56 rounded-full bg-[#FCEB14] opacity-5 blur-3xl"></div>
        <div className="absolute left-1/3 bottom-1/4 w-64 h-64 rounded-full bg-indigo-200 opacity-10 blur-3xl"></div>
        
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <span className="relative inline-block">
                Ce que disent
                <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
                  <path d="M0,6 C25,2 50,-1 75,2 C87,4 95,5 100,6 L0,6 Z" fill="#FCEB14" />
                </svg>
              </span>
              <span className="ml-2">nos clients</span>
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Découvrez les témoignages de nos clients satisfaits.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md relative overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:shadow-indigo-200/50 group">
              {/* Forme abstraite de sourire */}
              <div className="absolute -right-12 -top-12 w-24 h-24 rounded-full border-8 border-[#FCEB14]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((_, index) => (
                  <div key={index} className="text-[#FCEB14] ml-1 first:ml-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </div>
                ))}
              </div>
              <p className="text-gray-700 mb-4 relative">
                <span className="absolute -left-2 top-0 text-4xl text-indigo-200 opacity-50">"</span>
                <span className="relative">J'adore mes nouveaux t-shirts personnalisés de Smiletex ! La qualité est exceptionnelle et le service client est impeccable.</span>
              </p>
              <div className="font-bold text-gray-900 flex items-center">
                <span className="inline-block w-8 h-0.5 bg-[#FCEB14] mr-2"></span>
                Sophie Martin
              </div>
              
              {/* Indicateur de sourire subtil */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FCEB14] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md relative overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:shadow-indigo-200/50 group">
              {/* Forme abstraite de sourire */}
              <div className="absolute -right-12 -top-12 w-24 h-24 rounded-full border-8 border-[#FCEB14]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((_, index) => (
                  <div key={index} className="text-[#FCEB14] ml-1 first:ml-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </div>
                ))}
              </div>
              <p className="text-gray-700 mb-4 relative">
                <span className="absolute -left-2 top-0 text-4xl text-indigo-200 opacity-50">"</span>
                <span className="relative">La personnalisation est incroyable ! J'ai pu créer exactement ce que je voulais et la livraison a été plus rapide que prévu.</span>
              </p>
              <div className="font-bold text-gray-900 flex items-center">
                <span className="inline-block w-8 h-0.5 bg-[#FCEB14] mr-2"></span>
                Thomas Dubois
              </div>
              
              {/* Indicateur de sourire subtil */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FCEB14] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md relative overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:shadow-indigo-200/50 group">
              {/* Forme abstraite de sourire */}
              <div className="absolute -right-12 -top-12 w-24 h-24 rounded-full border-8 border-[#FCEB14]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((_, index) => (
                  <div key={index} className="text-[#FCEB14] ml-1 first:ml-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </div>
                ))}
              </div>
              <p className="text-gray-700 mb-4 relative">
                <span className="absolute -left-2 top-0 text-4xl text-indigo-200 opacity-50">"</span>
                <span className="relative">Smiletex offre un excellent rapport qualité-prix. Les vêtements sont confortables et les designs sont superbes !</span>
              </p>
              <div className="font-bold text-gray-900 flex items-center">
                <span className="inline-block w-8 h-0.5 bg-[#FCEB14] mr-2"></span>
                Julie Lefèvre
              </div>
              
              {/* Indicateur de sourire subtil */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FCEB14] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Formulaire de devis urgent */}
      <section className="py-16 md:py-24 bg-indigo-50 text-gray-800 relative overflow-hidden">
        {/* Éléments graphiques abstraits */}
        <div className="absolute left-0 top-1/4 w-72 h-72 rounded-full bg-[#FCEB14] opacity-5 blur-3xl"></div>
        <div className="absolute right-0 bottom-1/4 w-64 h-64 rounded-full bg-indigo-200 opacity-10 blur-3xl"></div>
        
        {/* Courbe souriante en haut de la section */}
        <div className="absolute top-0 left-0 right-0 overflow-hidden">
          <SmileCurve className="w-full h-16" color="text-white" rotate={true} />
        </div>
        
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              <span className="relative inline-block">
                Besoin de nous contacter
                <span className="relative inline-block text-indigo-700 ml-2">
                  rapidement
                  <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
                    <path d="M0,6 C25,2 50,-1 75,2 C87,4 95,5 100,6 L0,6 Z" fill="#FCEB14" />
                  </svg>
                </span> ?
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Remplissez ce formulaire et recevez votre devis personnalisé sous 24h !
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-black relative">
            {/* Forme abstraite de sourire */}
            <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full border-4 border-[#FCEB14] opacity-20"></div>
            <UrgentQuoteForm />
          </div>
        </div>
      </section>
    </div>
  );
}
