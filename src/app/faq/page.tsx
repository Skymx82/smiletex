import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-12 text-black">
      {/* Section Hero */}
      <div className="relative h-64 mb-12 rounded-lg overflow-hidden">
        <Image
          src="/images/hero-bg.png"
          alt="FAQ Smiletext"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-indigo-900 bg-opacity-70 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Foire Aux Questions</h1>
        </div>
      </div>

      {/* Introduction */}
      <div className="max-w-3xl mx-auto mb-12 text-center">
        <p className="text-lg text-gray-700">
          Vous trouverez ci-dessous les réponses aux questions les plus fréquemment posées sur nos services de personnalisation textile. Si vous ne trouvez pas la réponse à votre question, n&apos;hésitez pas à nous contacter directement.
        </p>
        <Link href="/contact" className="inline-block mt-4 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          Nous contacter
        </Link>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* Catégorie 1: Personnalisation */}
          <div>
            <h2 className="text-2xl font-bold text-indigo-800 mb-4">Personnalisation</h2>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quelles sont les techniques de personnalisation disponibles ?</h3>
                <p className="text-gray-700">
                  Nous proposons plusieurs techniques de personnalisation adaptées à vos besoins :
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                  <li>Le transfert DTF (Direct to Film) pour des impressions haute qualité avec des couleurs éclatantes</li>
                  <li>L&apos;impression DTG (Direct to Garment) pour des designs détaillés directement sur le textile</li>
                  <li>La broderie pour un rendu élégant et durable</li>
                  <li>Le flocage pour une texture veloutée et en relief</li>
                </ul>
                <p className="mt-2 text-gray-700">
                  Pour plus de détails sur ces techniques, consultez notre <Link href="/#techniques-marquage" className="text-indigo-600 hover:underline">section dédiée</Link>.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Puis-je personnaliser mes propres vêtements ?</h3>
                <p className="text-gray-700">
                  Oui, nous acceptons les vêtements fournis par le client. Vous pouvez nous apporter vos propres articles à personnaliser. Nous vous recommandons toutefois de nous consulter au préalable pour vérifier la compatibilité du textile avec la technique de marquage souhaitée.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quels fichiers dois-je fournir pour la personnalisation ?</h3>
                <p className="text-gray-700">
                  Pour un résultat optimal, nous recommandons de fournir des fichiers vectoriels (.ai, .eps, .pdf) ou des images haute résolution (minimum 300 dpi). Pour les designs complexes ou les photos, des formats .png ou .jpg de haute qualité sont acceptés. Si vous n&apos;avez pas de fichier adapté, notre équipe de designers peut vous aider à créer ou optimiser votre visuel.
                </p>
              </div>
            </div>
          </div>

          {/* Catégorie 2: Commandes et Délais */}
          <div>
            <h2 className="text-2xl font-bold text-indigo-800 mb-4">Commandes et Délais</h2>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quel est le délai de production pour une commande personnalisée ?</h3>
                <p className="text-gray-700">
                  Les délais de production varient selon la technique utilisée, la quantité commandée et notre planning de production. En général :
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                  <li>Petites commandes (1-10 pièces) : 3 à 5 jours ouvrés</li>
                  <li>Commandes moyennes (11-50 pièces) : 5 à 7 jours ouvrés</li>
                  <li>Grandes commandes (plus de 50 pièces) : 7 à 14 jours ouvrés</li>
                </ul>
                <p className="mt-2 text-gray-700">
                  Pour les commandes urgentes, nous proposons un service express avec un supplément. Contactez-nous pour en discuter.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quelle est la quantité minimum de commande ?</h3>
                <p className="text-gray-700">
                  Il n&apos;y a pas de quantité minimum pour commander. Nous acceptons les commandes à l&apos;unité ainsi que les grandes séries. Cependant, des tarifs dégressifs sont appliqués à partir de 10 pièces identiques.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Comment suivre ma commande ?</h3>
                <p className="text-gray-700">
                  Une fois votre commande confirmée, vous recevrez un email avec un numéro de suivi. Vous pourrez suivre l&apos;avancement de votre commande en vous connectant à votre compte client sur notre site. Pour les commandes importantes, un chef de projet vous tiendra informé des étapes clés de la production.
                </p>
              </div>
            </div>
          </div>

          {/* Catégorie 3: Qualité et Entretien */}
          <div>
            <h2 className="text-2xl font-bold text-indigo-800 mb-4">Qualité et Entretien</h2>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Comment entretenir mes vêtements personnalisés ?</h3>
                <p className="text-gray-700">
                  Pour préserver la qualité de vos personnalisations, nous recommandons :
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                  <li>Lavage à l&apos;envers à 30°C maximum</li>
                  <li>Éviter l&apos;utilisation de l&apos;eau de Javel et autres produits agressifs</li>
                  <li>Séchage à l&apos;air libre plutôt qu&apos;au sèche-linge</li>
                  <li>Repassage à l&apos;envers et à température modérée</li>
                </ul>
                <p className="mt-2 text-gray-700">
                  Des instructions d&apos;entretien spécifiques sont fournies avec chaque commande selon la technique utilisée.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quelle est la durabilité des personnalisations ?</h3>
                <p className="text-gray-700">
                  La durabilité varie selon la technique utilisée :
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                  <li>DTF : Excellente résistance au lavage, conserve ses couleurs pendant 50+ lavages</li>
                  <li>DTG : Bonne résistance, légère atténuation des couleurs possible après 30+ lavages</li>
                  <li>Broderie : Très durable, résiste à des centaines de lavages</li>
                  <li>Flocage : Bonne durabilité, peut montrer des signes d&apos;usure après 40+ lavages</li>
                </ul>
                <p className="mt-2 text-gray-700">
                  Toutes nos personnalisations sont garanties pour résister à un minimum de 30 lavages dans des conditions normales d&apos;utilisation et en suivant nos conseils d&apos;entretien.
                </p>
              </div>
            </div>
          </div>

          {/* Catégorie 4: Paiement et Livraison */}
          <div>
            <h2 className="text-2xl font-bold text-indigo-800 mb-4">Paiement et Livraison</h2>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quels sont les modes de paiement acceptés ?</h3>
                <p className="text-gray-700">
                  Nous acceptons plusieurs modes de paiement :
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                  <li>Carte bancaire (Visa, Mastercard)</li>
                  <li>PayPal</li>
                  <li>Virement bancaire (pour les commandes professionnelles)</li>
                </ul>
                <p className="mt-2 text-gray-700">
                  Pour les commandes professionnelles, nous proposons également le paiement à 30 jours sur facture après validation de votre dossier.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quels sont les frais et délais de livraison ?</h3>
                <p className="text-gray-700">
                  Les frais de livraison dépendent du poids de votre commande et de la destination :
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                  <li>Livraison standard en France métropolitaine : 5,90€ (2-3 jours ouvrés)</li>
                  <li>Livraison express en France métropolitaine : 9,90€ (24-48h)</li>
                  <li>Livraison en Europe : à partir de 12,90€ (3-5 jours ouvrés)</li>
                </ul>
                <p className="mt-2 text-gray-700">
                  La livraison est offerte pour toute commande supérieure à 99€ en France métropolitaine.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quelle est votre politique de retour ?</h3>
                <p className="text-gray-700">
                  Pour les articles non personnalisés, vous disposez d&apos;un délai de 14 jours pour nous retourner votre commande. Les articles doivent être retournés dans leur état d&apos;origine, non portés et avec leurs étiquettes.
                </p>
                <p className="mt-2 text-gray-700">
                  Conformément à la législation, les articles personnalisés selon vos spécifications ne peuvent être ni repris ni échangés, sauf en cas de défaut de fabrication avéré.
                </p>
                <p className="mt-2 text-gray-700">
                  En cas de défaut de fabrication, contactez notre service client dans les 7 jours suivant la réception pour obtenir un retour gratuit et un remplacement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-3xl mx-auto mt-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Vous avez d&apos;autres questions ?</h2>
        <p className="text-lg text-gray-700 mb-6">
          Notre équipe est à votre disposition pour répondre à toutes vos questions et vous accompagner dans votre projet de personnalisation.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/contact" className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            Nous contacter
          </Link>
          <Link href="/devis" className="px-6 py-3 border border-indigo-600 text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors">
            Demander un devis
          </Link>
        </div>
      </div>
    </div>
  );
}
