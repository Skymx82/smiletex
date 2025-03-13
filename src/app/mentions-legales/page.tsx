'use client';

export default function MentionsLegales() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mentions Légales</h1>
        
        <div className="bg-white shadow rounded-lg p-6 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations légales</h2>
            <p className="text-gray-600">
              Le site Smiletex est édité par :<br />
              Smiletex<br />
              6 chemin des voyageurs<br />
              69360 Ternay<br />
              France<br />
              Téléphone : 06 41 32 35 04<br />
              Email : contact@smiletext.fr
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Conditions Générales de Vente</h2>
            <div className="text-gray-600 space-y-4">
              <p>
                <strong>Article 1 - Commandes</strong><br />
                Toute commande passée sur le site implique l'acceptation intégrale des présentes conditions générales de vente.
              </p>
              
              <p>
                <strong>Article 2 - Prix</strong><br />
                Les prix sont indiqués en euros TTC. Smiletex se réserve le droit de modifier ses prix à tout moment.
              </p>

              <p>
                <strong>Article 3 - Livraison</strong><br />
                Les délais de livraison sont donnés à titre indicatif. Les retards éventuels ne donnent pas droit à l'acheteur d'annuler la vente ou de refuser la marchandise.
              </p>

              <p>
                <strong>Article 4 - Retours et échanges</strong><br />
                Conformément à la législation en vigueur, vous disposez d'un délai de 14 jours à compter de la réception de votre commande pour exercer votre droit de rétractation.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Protection des données personnelles</h2>
            <div className="text-gray-600 space-y-4">
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles.
              </p>
              <p>
                Les informations collectées sont utilisées uniquement dans le cadre de la gestion de votre commande et pour vous tenir informé de nos offres.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cookies</h2>
            <p className="text-gray-600">
              Notre site utilise des cookies pour améliorer votre expérience de navigation. Vous pouvez désactiver l'utilisation des cookies en modifiant les paramètres de votre navigateur.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
