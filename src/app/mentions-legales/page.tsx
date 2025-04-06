'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MentionsLegales() {
  const [activeTab, setActiveTab] = useState('mentions');

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-800 mb-4">Informations Légales</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Toutes les informations légales concernant notre entreprise, nos conditions générales de vente et notre politique de confidentialité.</p>
        </div>
        
        {/* Navigation tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-6 justify-center md:justify-start">
            <button
              onClick={() => setActiveTab('mentions')}
              className={`${activeTab === 'mentions' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm md:text-base transition-all duration-200`}
            >
              Mentions Légales
            </button>
            <button
              onClick={() => setActiveTab('cgv')}
              className={`${activeTab === 'cgv' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm md:text-base transition-all duration-200`}
              id="cgv"
            >
              Conditions Générales de Vente
            </button>
            <button
              onClick={() => setActiveTab('confidentialite')}
              className={`${activeTab === 'confidentialite' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm md:text-base transition-all duration-200`}
              id="confidentialite"
            >
              Politique de Confidentialité
            </button>
          </nav>
        </div>
        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Mentions Légales */}
          {activeTab === 'mentions' && (
            <div className="p-6 md:p-8 space-y-8">
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Informations sur l'entreprise
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Raison sociale</h3>
                    <p className="text-gray-600 leading-relaxed">
                      <strong>Smiletex</strong><br />
                      SARL au capital de 10 000€<br />
                      SIRET : 123 456 789 00012<br />
                      Code APE : 1812Z - Autre imprimerie (labeur)<br />
                      N° TVA Intracommunautaire : FR 12 123456789
                    </p>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Coordonnées</h3>
                    <p className="text-gray-600 leading-relaxed">
                      <strong>Adresse :</strong><br />
                      6 chemin des voyageurs<br />
                      69360 Ternay<br />
                      France<br />
                      <strong>Téléphone :</strong> <a href="tel:0641323504" className="text-indigo-600 hover:underline">06 41 32 35 04</a><br />
                      <strong>Email :</strong> <a href="mailto:contact@smiletex.fr" className="text-indigo-600 hover:underline">contact@smiletex.fr</a>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Hébergement du site
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Ce site est hébergé par :<br />
                  <strong>OVH SAS</strong><br />
                  2 rue Kellermann<br />
                  59100 Roubaix<br />
                  France<br />
                  <a href="https://www.ovh.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">www.ovh.com</a>
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                  Propriété intellectuelle
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  L'ensemble des éléments constituant ce site (textes, graphismes, logiciels, photographies, images, vidéos, sons, plans, logos, marques, etc.) est la propriété exclusive de Smiletex ou de ses partenaires. Ces éléments sont protégés par les lois françaises et internationales relatives aux droits de propriété intellectuelle.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de Smiletex.
                </p>
              </div>
            </div>
          )}
          
          {/* CGV */}
          {activeTab === 'cgv' && (
            <div className="p-6 md:p-8 space-y-8">
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Conditions Générales de Vente
                </h2>
                <p className="text-gray-600 mb-4 italic">
                  En vigueur au {new Date().toLocaleDateString('fr-FR')} - Dernière mise à jour le 01/04/2025
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Article 1 - Champ d'application</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Les présentes Conditions Générales de Vente (CGV) constituent le socle de la négociation commerciale et sont systématiquement adressées ou remises à chaque acheteur pour lui permettre de passer commande.<br /><br />
                    Les CGV s'appliquent à toutes les ventes de produits et services effectuées par Smiletex et sont partie intégrante du contrat entre l'acheteur et le vendeur. Toute commande de produits implique l'acceptation sans réserve par l'acheteur des présentes CGV.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Article 2 - Commandes</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Les commandes peuvent être passées sur notre site internet, par téléphone, ou par email. Toute commande est ferme et définitive dès sa confirmation par Smiletex.<br /><br />
                    Pour les commandes personnalisées, un bon à tirer (BAT) sera soumis à l'approbation du client avant production. La validation du BAT par le client engage sa responsabilité concernant le contenu et la qualité des éléments validés.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Article 3 - Prix et modalités de paiement</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Les prix sont indiqués en euros et toutes taxes comprises (TTC). Ils sont susceptibles d'être modifiés à tout moment, mais les produits seront facturés sur la base des tarifs en vigueur au moment de l'enregistrement des commandes.<br /><br />
                    Pour les commandes standard, le paiement intégral est exigé lors de la commande. Pour les commandes personnalisées ou de gros volumes, un acompte de 30% minimum sera demandé à la commande, le solde étant payable avant livraison.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Article 4 - Livraison</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Les délais de livraison sont donnés à titre indicatif. Smiletex s'efforce de respecter les délais de livraison qu'elle indique à l'acceptation de la commande, en fonction du délai logistique de référence dans la profession.<br /><br />
                    Les retards de livraison ne peuvent donner lieu à aucune pénalité ou indemnité, ni motiver l'annulation de la commande. Toutefois, si 30 jours après la date indicative de livraison le produit n'a pas été livré, pour toute autre cause qu'un cas de force majeure, la vente pourra être résolue à la demande de l'une ou l'autre partie.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Article 5 - Droit de rétractation</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Conformément aux dispositions légales en vigueur, vous disposez d'un délai de 14 jours à compter de la réception de vos produits pour exercer votre droit de rétractation sans avoir à justifier de motifs ni à payer de pénalité.<br /><br />
                    En cas d'exercice du droit de rétractation, Smiletex procédera au remboursement des sommes versées, dans un délai de 14 jours suivant la notification de votre demande.<br /><br />
                    <strong>EXCEPTION :</strong> Le droit de rétractation ne peut être exercé pour les produits personnalisés selon les spécifications du consommateur ou nettement personnalisés (article L221-28 du Code de la consommation).
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Politique de confidentialité */}
          {activeTab === 'confidentialite' && (
            <div className="p-6 md:p-8 space-y-8">
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Politique de Confidentialité
                </h2>
                <p className="text-gray-600 mb-4 italic">
                  Dernière mise à jour : 01/04/2025
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">1. Collecte des données personnelles</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Dans le cadre de l'utilisation du site Smiletex, nous pouvons être amenés à collecter les données personnelles suivantes :
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-gray-600 space-y-1">
                    <li>Nom et prénom</li>
                    <li>Adresse email</li>
                    <li>Numéro de téléphone</li>
                    <li>Adresse postale</li>
                    <li>Informations de paiement (traitées de manière sécurisée par nos prestataires de paiement)</li>
                    <li>Historique des commandes</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">2. Utilisation des données</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Les données personnelles collectées sont utilisées pour :
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-gray-600 space-y-1">
                    <li>Traiter vos commandes et assurer le service client</li>
                    <li>Gérer votre compte client</li>
                    <li>Personnaliser votre expérience utilisateur</li>
                    <li>Vous informer sur nos offres et nouveautés (si vous avez accepté de recevoir nos communications)</li>
                    <li>Améliorer nos produits et services</li>
                    <li>Respecter nos obligations légales et réglementaires</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">3. Protection des données</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles contre la destruction accidentelle ou illicite, la perte accidentelle, l'altération, la diffusion ou l'accès non autorisé.<br /><br />
                    Les données personnelles sont conservées pour la durée nécessaire à l'accomplissement des finalités pour lesquelles elles ont été collectées, augmentée des délais légaux de conservation et de prescription.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">4. Vos droits</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants concernant vos données personnelles :
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-gray-600 space-y-1">
                    <li>Droit d'accès</li>
                    <li>Droit de rectification</li>
                    <li>Droit à l'effacement ("droit à l'oubli")</li>
                    <li>Droit à la limitation du traitement</li>
                    <li>Droit à la portabilité des données</li>
                    <li>Droit d'opposition</li>
                  </ul>
                  <p className="text-gray-600 leading-relaxed mt-3">
                    Pour exercer ces droits, vous pouvez nous contacter à l'adresse email suivante : <a href="mailto:privacy@smiletex.fr" className="text-indigo-600 hover:underline">privacy@smiletex.fr</a>
                  </p>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">5. Cookies</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Notre site utilise des cookies pour améliorer votre expérience de navigation, analyser l'utilisation du site et personnaliser le contenu. Vous pouvez configurer votre navigateur pour refuser tous les cookies ou être informé quand un cookie est envoyé. Cependant, certaines fonctionnalités du site peuvent ne pas fonctionner correctement si les cookies sont désactivés.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-10 text-center">
          <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
