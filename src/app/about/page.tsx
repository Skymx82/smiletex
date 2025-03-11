import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Section Hero */}
      <div className="relative h-96 mb-12 rounded-lg overflow-hidden">
        <Image
          src="/images/lyon.avif"
          alt="Atelier Smiletext"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-5xl font-bold text-white">Notre Histoire</h1>
        </div>
      </div>

      {/* Section Histoire */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-black">Une Passion Née de l'Expérience</h2>
          <p className="text-lg text-gray-700">
            Mon parcours dans le monde de la personnalisation textile est le fruit d'une reconversion inspirée. Après une carrière dans le transport, un accident en 2021 m'a amené à repenser mon avenir professionnel.
          </p>
          <p className="text-lg text-gray-700">
            Cette réflexion n'est pas venue de nulle part - depuis 2020, je cultivais déjà ma passion pour le flocage en auto-entrepreneur, en parallèle de mon activité principale. Ce qui n'était qu'un projet annexe est devenu une évidence.
          </p>
          <p className="text-lg text-gray-700">
            En 2024, j'ai pris la décision de me consacrer entièrement à ma passion : la personnalisation textile. C'est ainsi qu'est né Smiletext, un projet qui allie expertise technique et créativité.
          </p>
        </div>
        <div className="relative h-96 rounded-lg overflow-hidden">
          <Image
            src="/images/yoan.png"
            alt="Atelier Smiletext"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Section Valeurs */}
      <div className="mt-16 bg-indigo-50 p-12 rounded-lg">
        <h2 className="text-3xl font-bold text-black mb-6">Nos Valeurs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-indigo-600">Expertise</h3>
            <p className="text-gray-700">
              Notre expérience dans le domaine nous permet de vous garantir un travail de qualité, réalisé avec des techniques maîtrisées et un souci du détail constant.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-indigo-600">Personnalisation</h3>
            <p className="text-gray-700">
              Chaque projet est unique. Nous prenons le temps d'écouter vos besoins pour vous proposer la solution la plus adaptée à vos envies.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-indigo-600">Engagement</h3>
            <p className="text-gray-700">
              Nous nous engageons à vous offrir un service de qualité, des délais respectés et un accompagnement personnalisé tout au long de votre projet.
            </p>
          </div>
        </div>
      </div>

      {/* Section Mission */}
      <div className="mt-16 bg-indigo-50 p-12 rounded-lg">
        <h2 className="text-3xl font-bold text-black mb-6">Notre Mission</h2>
        <p className="text-lg text-gray-700">
          Smiletext est bien plus qu'une marque de vêtements. C'est une communauté de personnes qui croient en l'importance de s'exprimer à travers leur style, tout en faisant des choix responsables.
        </p>
      </div>

      {/* Section Techniques de marquage */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-black mb-8">Nos techniques de marquage</h2>
        <p className="text-lg text-gray-700 mb-12">
          Nous maîtrisons un ensemble de techniques de marquage pour répondre à tous vos besoins, afin de nous permettre d'offrir une personnalisation adaptée à chaque projet.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Image
              src="/images/dtf.jpg"
              alt="Transfert DTF"
              width={300}
              height={200}
              className="rounded-lg mb-4"
            />
            <h3 className="text-xl font-bold text-black mb-2">Le transfert DTF</h3>
            <p className="text-gray-700">
              Le transfert DTF est une technologie innovante, permettant des impressions textiles de haute qualité. Elle offre des couleurs éclatantes, des détails précis et une durabilité exceptionnelle.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Image
              src="/images/dtg.png"
              alt="Impression DTG"
              width={300}
              height={200}
              className="rounded-lg mb-4"
            />
            <h3 className="text-xl font-bold text-black mb-2">L'impression DTG</h3>
            <p className="text-gray-700">
              L'impression DTG réalise des impressions détaillées directement sur les vêtements, offrant des résultats précis et durables pour des designs personnalisés.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Image
              src="/images/broderie.png"
              alt="Broderie"
              width={300}
              height={200}
              className="rounded-lg mb-4"
            />
            <h3 className="text-xl font-bold text-black mb-2">La broderie</h3>
            <p className="text-gray-700">
              La broderie ajoute une touche élégante et durable à vos textiles avec des motifs détaillés en fils de haute qualité.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Image
              src="/images/flocage.jpg"
              alt="Flocage"
              width={300}
              height={200}
              className="rounded-lg mb-4"
            />
            <h3 className="text-xl font-bold text-black mb-2">Le flocage</h3>
            <p className="text-gray-700">
              Le flocage offre une texture veloutée et en relief, parfaite pour des designs audacieux et distinctifs.
            </p>
          </div>
        </div>
      </div>

      {/* Section CTA */}
      <div className="mt-16 text-center">
        <h2 className="text-3xl font-bold text-black mb-6">Rejoignez l'aventure Smiletext</h2>
        <Link href="/products" className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition-colors text-lg">
          Découvrez notre collection
        </Link>
      </div>
    </div>
  );
}