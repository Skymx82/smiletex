'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCartContext } from '@/components/CartProvider';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { itemCount } = useCartContext();
  const user = null;

  return (
    <header className="bg-[#121236] text-white shadow-md relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold">Smiletex</span>
            </Link>
          </div>

          {/* Navigation centrale sur PC */}
          <div className="hidden md:flex flex-1 justify-center items-center">
            <nav className="flex space-x-8">
              <Link href="/products" className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-base font-medium flex items-center h-16">
                Produits
              </Link>
              <Link href="/customizer" className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-base font-medium flex items-center h-16">
                Personnaliser
              </Link>
              <Link href="/about" className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-base font-medium flex items-center h-16">
                À propos
              </Link>
              <Link href="/contact" className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-base font-medium flex items-center h-16">
                Contact
              </Link>
            </nav>
          </div>

          {/* Panier et menu mobile */}
          <div className="flex items-center">
            <Link href="/cart" className="p-2 text-white hover:text-indigo-200 relative">
              <span className="sr-only">Panier</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-indigo-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:text-indigo-200 hover:bg-[#1a1a4f] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-expanded="false"
            >
              <span className="sr-only">Ouvrir le menu principal</span>
              {!mobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      <div 
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Overlay sombre */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={() => setMobileMenuOpen(false)}
        />
        {/* Panneau du menu */}
        <div 
          className={`fixed inset-y-0 right-0 w-64 bg-[#121236] shadow-xl transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex justify-end p-4">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-white hover:text-indigo-200"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="px-4 py-2 space-y-3">
            <Link 
              href="/products" 
              className="block px-4 py-2 text-base font-medium text-white hover:bg-[#1a1a4f] hover:text-indigo-200 rounded-lg transition-colors duration-150"
              onClick={() => setMobileMenuOpen(false)}
            >
              Produits
            </Link>
            <Link 
              href="/customizer" 
              className="block px-4 py-2 text-base font-medium text-white hover:bg-[#1a1a4f] hover:text-indigo-200 rounded-lg transition-colors duration-150"
              onClick={() => setMobileMenuOpen(false)}
            >
              Personnaliser
            </Link>
            <Link 
              href="/about" 
              className="block px-4 py-2 text-base font-medium text-white hover:bg-[#1a1a4f] hover:text-indigo-200 rounded-lg transition-colors duration-150"
              onClick={() => setMobileMenuOpen(false)}
            >
              À propos
            </Link>
            <Link 
              href="/contact" 
              className="block px-4 py-2 text-base font-medium text-white hover:bg-[#1a1a4f] hover:text-indigo-200 rounded-lg transition-colors duration-150"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
