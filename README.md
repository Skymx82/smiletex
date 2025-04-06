This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# E-commerce de Personnalisation de Produits - smiletex

## À propos

Cette plateforme e-commerce permet aux utilisateurs de personnaliser des vêtements et accessoires (t-shirts, sweats, etc.), de les ajouter à leur panier et de finaliser leurs achats via un système de paiement sécurisé. Le projet offre une expérience de shopping interactive où les clients peuvent visualiser leurs personnalisations en temps réel avant l'achat.

## Fonctionnalités Principales

### Catalogue de Produits
- Affichage des produits disponibles avec informations détaillées (tailles, couleurs, stocks)
- Filtrage par catégories, collections et prix
- Mise en avant des nouveautés et meilleures ventes
- Recherche intuitive de produits

### Personnalisation de Produits
- Options de personnalisation multiples (couleurs, polices, etc.)
- Visualisation en temps réel des personnalisations
- Sauvegarde des designs pour une utilisation ultérieure

### Gestion du Panier
- Ajout/suppression d'articles avec conservation des personnalisations
- Possibilité de commander plusieurs articles de différentes tailles et couleurs
- Modification des quantités pour chaque variante de produit
- Calcul automatique des prix en fonction des options choisies
- Sauvegarde du panier pour les utilisateurs connectés

## Architecture et Bonnes Pratiques

### Séparation Client/Serveur
- Les composants de page (page.tsx) sont des composants serveur qui extraient les paramètres de route
- Les composants client (comme ProductDetail.tsx) reçoivent ces paramètres en tant que props
- Cette architecture permet d'éviter les problèmes liés à l'accès direct aux paramètres de route dans les composants client

### Gestion des Variantes de Produits
- Les variantes (taille, couleur) sont chargées avec le produit via le hook useProduct
- La sélection des variantes met à jour dynamiquement les informations de stock et de prix
- Vérification de la disponibilité en stock avant l'ajout au panier

## Structure du Projet

```
/
├── src/
│   ├── app/                # Pages de l'application Next.js (App Router)
│   │   ├── api/            # Routes API (checkout, webhook, orders)
│   │   ├── cart/           # Page du panier
│   │   ├── checkout/       # Pages de paiement et confirmation
│   │   └── products/       # Pages de catalogue et détail produit
│   │       └── [id]/       # Page de détail produit
│   │           ├── page.tsx            # Composant serveur qui extrait l'ID
│   │           └── ProductDetail.tsx   # Composant client avec la logique UI
│   ├── components/         # Composants React réutilisables
│   │   └── CartProvider.tsx # Contexte global du panier
│   ├── hooks/              # Hooks personnalisés (useCart, useProducts)
│   ├── lib/                # Utilitaires et configuration
│   │   ├── supabase/       # Configuration Supabase
│   │   ├── stripe/         # Configuration Stripe
│   │   └── products.ts     # Types et fonctions liés aux produits
├── public/                # Fichiers statiques
└── README.md              # Ce fichier

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
