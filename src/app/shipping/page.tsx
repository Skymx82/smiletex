'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ShippingPage() {
  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* En-tête de la page */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Livraison</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez nos options de livraison pour recevoir vos produits personnalisés smiletex
          </p>
        </div>

        {/* Bannière avec formes */}
        <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-16 shadow-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          {/* Formes décoratives */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-white opacity-10 rounded-full translate-x-1/4 translate-y-1/4"></div>
          <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white opacity-10 rounded-full transform -translate-y-1/2"></div>
          <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-white opacity-10 rounded-full"></div>
          
          {/* Motifs de livraison stylisés */}
          <div className="absolute top-10 right-10 text-white opacity-20">
            <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.15 8a2 2 0 0 0-1.72-1H15V5a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1a3 3 0 0 0 6 0h2a3 3 0 0 0 6 0h1a1 1 0 0 0 1-1v-5.23a2 2 0 0 0-.15-.77zM8 18a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm8 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm2-3h-.78a3 3 0 0 0-4.44 0H9.22a3 3 0 0 0-4.44 0H4V6h9v1h-4a1 1 0 0 0 0 2h6.62l4.38 2.92z"></path>
            </svg>
          </div>
          <div className="absolute bottom-10 left-10 text-white opacity-20">
            <svg className="h-20 w-20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.54 6.29A4 4 0 0 0 19 5.33V3a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v2.33a4 4 0 0 0-1.54 1A4.06 4.06 0 0 0 2 10a4.06 4.06 0 0 0 1.46 3.63A4 4 0 0 0 5 14.67V21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6.33a4 4 0 0 0 1.54-1A4.06 4.06 0 0 0 22 10a4.06 4.06 0 0 0-1.46-3.71zM7 4h10v1.2a3.93 3.93 0 0 0-2 0V5h-6v.2a3.93 3.93 0 0 0-2 0zm10 16H7v-5.33A3.59 3.59 0 0 0 8 14a4 4 0 0 0 1.4-.26 1 1 0 0 0 .82.26h3.56a1 1 0 0 0 .82-.26A4 4 0 0 0 16 14a3.59 3.59 0 0 0 1 .67z"></path>
            </svg>
          </div>
          
          {/* Contenu central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white p-6 rounded-lg z-10">
              <h2 className="text-3xl font-bold mb-2 drop-shadow-md">Livraison rapide et sécurisée</h2>
              <p className="text-lg drop-shadow-md">Nous prenons soin de vos commandes personnalisées</p>
            </div>
          </div>
        </div>

        {/* Options de livraison */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Nos options de livraison</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Option 1 */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center mb-3">Livraison standard</h3>
              <p className="text-gray-600 mb-4 text-center">
                Livraison en 3-5 jours ouvrables pour toutes vos commandes standard.
              </p>
              <div className="text-center font-bold text-indigo-600 text-lg">4,99 €</div>
            </div>
            
            {/* Option 2 */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300 relative">
              <div className="absolute -top-3 right-4">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  Recommandé
                </span>
              </div>
              <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center mb-3">Livraison express</h3>
              <p className="text-gray-600 mb-4 text-center">
                Livraison en 1-2 jours ouvrables pour vos commandes urgentes.
              </p>
              <div className="text-center font-bold text-indigo-600 text-lg">9,99 €</div>
            </div>
            
            {/* Option 3 */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center mb-3">Livraison gratuite</h3>
              <p className="text-gray-600 mb-4 text-center">
                Livraison standard gratuite pour toute commande supérieure à 80 €.
              </p>
              <div className="text-center font-bold text-green-600 text-lg">GRATUIT</div>
            </div>
          </div>
        </div>

        {/* Informations de livraison */}
        <div className="bg-gray-50 rounded-xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations importantes</h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 text-indigo-600 mt-0.5">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">Délais de fabrication</h3>
                <p className="mt-1 text-gray-600">
                  Les délais de livraison indiqués n'incluent pas le temps de fabrication pour les produits personnalisés, qui est généralement de 1 à 2 jours ouvrables supplémentaires.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 text-indigo-600 mt-0.5">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">Zone de livraison</h3>
                <p className="mt-1 text-gray-600">
                  Nous livrons dans toute la France métropolitaine et en Corse. Pour les DOM-TOM et l'international, veuillez nous contacter pour obtenir un devis personnalisé.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 text-indigo-600 mt-0.5">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">Suivi de commande</h3>
                <p className="mt-1 text-gray-600">
                  Un numéro de suivi vous sera envoyé par email dès que votre commande sera expédiée. Vous pourrez suivre votre colis en temps réel sur notre site ou sur celui du transporteur.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 text-indigo-600 mt-0.5">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">Retours et échanges</h3>
                <p className="mt-1 text-gray-600">
                  Les produits personnalisés ne sont ni repris ni échangés, sauf en cas de défaut de fabrication. Pour plus d'informations, consultez notre politique de retour.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Questions fréquentes sur la livraison</h2>
          
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button className="w-full flex justify-between items-center p-4 bg-white hover:bg-gray-50 transition-colors">
                <span className="text-lg font-medium text-gray-900">Comment suivre ma commande ?</span>
                <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <p className="text-gray-600">
                  Vous recevrez un email avec un numéro de suivi dès que votre commande sera expédiée. Vous pourrez cliquer sur ce numéro pour suivre votre colis en temps réel. Vous pouvez également consulter l'état de votre commande dans votre espace client.
                </p>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button className="w-full flex justify-between items-center p-4 bg-white hover:bg-gray-50 transition-colors">
                <span className="text-lg font-medium text-gray-900">Puis-je modifier l'adresse de livraison après avoir passé ma commande ?</span>
                <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <p className="text-gray-600">
                  Vous pouvez modifier l'adresse de livraison tant que votre commande n'a pas été expédiée. Pour cela, contactez notre service client dès que possible avec votre numéro de commande et la nouvelle adresse.
                </p>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button className="w-full flex justify-between items-center p-4 bg-white hover:bg-gray-50 transition-colors">
                <span className="text-lg font-medium text-gray-900">Que faire si mon colis est endommagé à la livraison ?</span>
                <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <p className="text-gray-600">
                  Si votre colis est visiblement endommagé à la livraison, nous vous recommandons de faire des réserves auprès du livreur. Prenez des photos de l'emballage et du produit endommagé, puis contactez notre service client dans les 48 heures avec ces preuves et votre numéro de commande.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Une question sur votre livraison ?</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Notre équipe est à votre disposition pour répondre à toutes vos questions concernant la livraison de vos produits personnalisés.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/contact" className="bg-white text-indigo-700 hover:bg-gray-100 px-6 py-3 rounded-lg font-bold transition-colors shadow-md">
              Contactez-nous
            </Link>
            <Link href="/faq" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-indigo-700 px-6 py-3 rounded-lg font-bold transition-colors">
              Consulter la FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
