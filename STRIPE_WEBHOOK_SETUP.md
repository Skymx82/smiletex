# Guide de Configuration du Webhook Stripe

Ce guide explique comment configurer le webhook Stripe pour votre application e-commerce Smiletext.

> **Note importante**: La configuration complète du webhook Stripe nécessite que votre site soit accessible en ligne. Cette étape devra être finalisée après le déploiement de l'application. Pour le développement local, vous pouvez utiliser Stripe CLI comme expliqué ci-dessous.

## Étape 1 : Créer un webhook dans le tableau de bord Stripe

1. Connectez-vous à votre [compte Stripe](https://dashboard.stripe.com/)
2. Dans le menu de gauche, allez dans **Développeurs > Webhooks**
3. Cliquez sur **Ajouter un endpoint**
4. Dans le champ URL de l'endpoint, entrez l'URL de votre webhook :
   - Pour le développement local avec Stripe CLI : `http://localhost:3000/api/webhook`
   - Pour la production : `https://votre-domaine.com/api/webhook` (à configurer après le déploiement)
5. Dans la section "Événements à écouter", sélectionnez :
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
6. Cliquez sur **Ajouter un endpoint** pour confirmer

## Étape 2 : Obtenir la clé secrète du webhook

Une fois le webhook créé, Stripe vous fournira une clé secrète de signature. Cette clé est utilisée pour vérifier que les événements proviennent bien de Stripe.

1. Dans la page de détails du webhook, cliquez sur **Révéler** à côté de "Clé de signature"
2. Copiez cette clé et ajoutez-la à votre fichier `.env.local` :
   ```
   STRIPE_WEBHOOK_SECRET=votre_clé_secrète_de_webhook
   ```

## Étape 3 : Tester le webhook en local avec Stripe CLI

Pour tester votre webhook en développement local, vous pouvez utiliser Stripe CLI :

1. [Téléchargez et installez Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Connectez-vous à votre compte Stripe :
   ```bash
   stripe login
   ```
3. Transmettez les événements à votre serveur local :
   ```bash
   stripe listen --forward-to http://localhost:3000/api/webhook
   ```
4. Stripe CLI vous fournira une clé de webhook pour les tests locaux. Utilisez cette clé dans votre fichier `.env.local` pendant le développement.

## À faire après le déploiement

Une fois votre site déployé et accessible en ligne, vous devrez :

1. Mettre à jour l'URL du webhook dans le tableau de bord Stripe pour pointer vers votre domaine de production
2. Obtenir une nouvelle clé secrète de webhook pour l'environnement de production
3. Configurer cette clé dans les variables d'environnement de votre serveur de production
4. Tester le webhook en effectuant un achat test sur votre site en production

## Étape 4 : Tester le webhook

Pour tester si votre webhook fonctionne correctement :

1. Créez une session de paiement test dans votre application
2. Complétez le paiement avec une carte de test Stripe (ex: 4242 4242 4242 4242)
3. Vérifiez dans les logs de votre application que l'événement `checkout.session.completed` est bien reçu et traité
4. Vérifiez dans Supabase que le statut de la commande a été mis à jour à "paid"

## Dépannage

Si vous rencontrez des problèmes avec votre webhook :

1. Vérifiez les logs de votre application pour voir les erreurs
2. Dans le tableau de bord Stripe, allez dans **Développeurs > Webhooks > [Votre Webhook] > Tentatives** pour voir les événements envoyés et leur statut
3. Assurez-vous que la clé secrète du webhook dans votre `.env.local` correspond bien à celle fournie par Stripe
4. Vérifiez que votre serveur est accessible depuis Internet si vous testez en production

## Ressources supplémentaires

- [Documentation Stripe sur les webhooks](https://stripe.com/docs/webhooks)
- [Guide Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Tester les webhooks Stripe](https://stripe.com/docs/webhooks/test)
