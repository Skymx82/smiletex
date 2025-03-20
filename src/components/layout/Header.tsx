'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartContext } from '@/components/CartProvider';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { useCategories } from '@/hooks/useProducts';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);
  const productsMenuRef = useRef<HTMLDivElement>(null);
  const { itemCount } = useCartContext();
  const { user } = useAuth();
  const pathname = usePathname();
  // N'afficher que les catégories principales (sans parent_id)
  const { categories, loading: categoriesLoading } = useCategories(true);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productsMenuRef.current && !productsMenuRef.current.contains(event.target as Node)) {
        setProductsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className={`${scrolled ? 'bg-white' : 'bg-indigo-50'} text-black shadow-md sticky top-0 transition-all duration-300 ease-in-out z-40`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/images/logo.png" 
                alt="Smiletex" 
                width={150} 
                height={40} 
                className="h-10 w-auto transition-opacity duration-300"
                priority
              />
            </Link>
          </div>

          {/* Navigation centrale sur PC */}
          <div className="hidden md:flex flex-1 justify-center items-center">
            <nav className="flex space-x-8">
              <div 
                ref={productsMenuRef} 
                className="relative h-16 flex items-center"
                onMouseEnter={() => setProductsMenuOpen(true)}
                onMouseLeave={() => setProductsMenuOpen(false)}
              >
                <Link 
                  href="/products" 
                  className={`${pathname === '/products' ? 'text-indigo-700 border-b-2 border-indigo-700' : 'text-black hover:text-indigo-700'} px-3 py-2 rounded-md text-base font-medium flex items-center h-16 transition-all duration-200`}
                  onClick={() => setProductsMenuOpen(false)}
                >
                  <span>Produits</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`ml-1 h-4 w-4 transition-transform duration-200 ${productsMenuOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
                
                {/* Sous-menu des catégories */}
                <div 
                  className={`absolute top-16 left-0 w-56 bg-white shadow-lg rounded-md py-2 transition-all duration-200 z-50 ${productsMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
                >
                  <Link 
                    href="/products" 
                    className="block px-4 py-2 text-sm text-gray-800 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    onClick={() => setProductsMenuOpen(false)}
                  >
                    Tous les produits
                  </Link>
                  {categoriesLoading ? (
                    <div className="px-4 py-2 text-sm text-gray-500">Chargement...</div>
                  ) : (
                    categories.map(category => (
                      <Link 
                        key={category.id} 
                        href={`/products?category=${category.id}`}
                        className="block px-4 py-2 text-sm text-gray-800 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                        onClick={() => setProductsMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))
                  )}
                </div>
              </div>
              <Link href="/devis" className={`${pathname === '/devis' ? 'text-indigo-700 border-b-2 border-indigo-700' : 'text-black hover:text-indigo-700'} px-3 py-2 rounded-md text-base font-medium flex items-center h-16 transition-all duration-200`}>
                Devis Rapide
              </Link>
              <Link href="/about" className={`${pathname === '/about' ? 'text-indigo-700 border-b-2 border-indigo-700' : 'text-black hover:text-indigo-700'} px-3 py-2 rounded-md text-base font-medium flex items-center h-16 transition-all duration-200`}>
                À propos
              </Link>
              <Link href="/contact" className={`${pathname === '/contact' ? 'text-indigo-700 border-b-2 border-indigo-700' : 'text-black hover:text-indigo-700'} px-3 py-2 rounded-md text-base font-medium flex items-center h-16 transition-all duration-200`}>
                Contact
              </Link>
            </nav>
          </div>

          {/* Panier, connexion et menu mobile */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="hidden md:flex items-center">
                <Link 
                  href="/account" 
                  className={`flex items-center space-x-2 ${pathname === '/account' ? 'text-indigo-700' : 'text-black hover:text-indigo-700'} transition-colors duration-200`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium">Mon compte</span>
                </Link>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/login"
                  className={`text-sm font-medium ${scrolled ? 'text-indigo-800 hover:text-indigo-600' : 'text-black hover:text-indigo-700'} transition-colors duration-200`}
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className={`${scrolled ? 'bg-indigo-700' : 'bg-indigo-600'} text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200`}
                >
                  Inscription
                </Link>
              </div>
            )}
            <Link href="/cart" className={`p-2 ${scrolled ? 'text-indigo-800 hover:text-indigo-600' : 'text-black hover:text-indigo-700'} relative transition-colors duration-200`}>
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
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-black hover:text-indigo-700 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
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
          className={`fixed inset-y-0 right-0 w-64 bg-indigo-50 shadow-xl transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex justify-end p-4">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-black hover:text-indigo-700"
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
            <div className="space-y-1">
              <div className="flex items-center justify-between px-4 py-2 text-base font-medium text-black hover:bg-indigo-100 hover:text-indigo-700 rounded-lg transition-colors duration-150">
                <Link 
                  href="/products" 
                  className="flex-grow"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Produits
                </Link>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const submenu = document.getElementById('mobile-products-submenu');
                    if (submenu) {
                      submenu.classList.toggle('hidden');
                    }
                  }}
                  className="p-1"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              {/* Sous-menu mobile des catégories */}
              <div id="mobile-products-submenu" className="pl-4 hidden space-y-1">
                <Link 
                  href="/products" 
                  className="block px-4 py-2 text-sm font-medium text-black hover:bg-indigo-100 hover:text-indigo-700 rounded-lg transition-colors duration-150"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tous les produits
                </Link>
                {categoriesLoading ? (
                  <div className="px-4 py-2 text-sm text-gray-500">Chargement...</div>
                ) : (
                  categories.map(category => (
                    <Link 
                      key={category.id} 
                      href={`/products?category=${category.id}`}
                      className="block px-4 py-2 text-sm font-medium text-black hover:bg-indigo-100 hover:text-indigo-700 rounded-lg transition-colors duration-150"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))
                )}
              </div>
            </div>
            <Link 
              href="/devis" 
              className="block px-4 py-2 text-base font-medium text-black hover:bg-indigo-100 hover:text-indigo-700 rounded-lg transition-colors duration-150"
              onClick={() => setMobileMenuOpen(false)}
            >
              Devis rapide
            </Link>
            <Link 
              href="/about" 
              className="block px-4 py-2 text-base font-medium text-black hover:bg-indigo-100 hover:text-indigo-700 rounded-lg transition-colors duration-150"
              onClick={() => setMobileMenuOpen(false)}
            >
              À propos
            </Link>
            <Link 
              href="/contact" 
              className="block px-4 py-2 text-base font-medium text-black hover:bg-indigo-100 hover:text-indigo-700 rounded-lg transition-colors duration-150"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            {user ? (
              <>
                <Link 
                  href="/account" 
                  className="block px-4 py-2 text-base font-medium text-black hover:bg-indigo-100 hover:text-indigo-700 rounded-lg transition-colors duration-150"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mon compte
                </Link>

              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="block px-4 py-2 text-base font-medium text-black hover:bg-indigo-100 hover:text-indigo-700 rounded-lg transition-colors duration-150"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link 
                  href="/register" 
                  className="block px-4 py-2 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-150"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
