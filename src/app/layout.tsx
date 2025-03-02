import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
import CartButton from "@/components/CartButton";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smiletex - Votre boutique de vêtements personnalisés",
  description: "Découvrez notre collection de vêtements personnalisables et créez votre style unique avec Smiletex.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-gray-50 min-h-screen flex flex-col">
        <AuthProvider>
          <CartProvider>
            <header className="bg-[#121236] text-white shadow-md">
              <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                  <Link href="/" className="flex items-center">
                    <span className="text-2xl font-bold">Smiletex</span>
                  </Link>
                  <nav className="hidden md:flex space-x-8">
                    <Link href="/" className="font-medium hover:text-indigo-200 transition-colors">Accueil</Link>
                    <Link href="/products" className="font-medium hover:text-indigo-200 transition-colors">Produits</Link>
                    <Link href="/about" className="font-medium hover:text-indigo-200 transition-colors">À propos</Link>
                    <Link href="/contact" className="font-medium hover:text-indigo-200 transition-colors">Contact</Link>
                  </nav>
                  <div className="flex items-center space-x-4">
                    <CartButton />
                    <button className="md:hidden">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </header>
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
