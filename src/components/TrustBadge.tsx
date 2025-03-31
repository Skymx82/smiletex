'use client';

import React from 'react';
import Image from 'next/image';

export default function TrustBadge() {
  return (
    <div className="relative py-6 px-8 bg-indigo-50 border-b border-gray-200 text-black overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700"></div>
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-100 rounded-full opacity-30"></div>
      <div className="absolute -top-8 right-20 w-24 h-24 bg-indigo-100 rounded-full opacity-30"></div>
      
      <div className="flex justify-between items-center relative z-10 max-w-7xl mx-auto">
        {/* Badges de confiance à gauche */}
        <div className="flex items-center space-x-10">
          {/* Badge Imprimé en France */}
          <div className="group flex items-center space-x-3 transition-all duration-300 hover:translate-y-[-2px]">
            <div className="bg-white p-3 rounded-lg shadow-sm border border-indigo-200 group-hover:shadow-md group-hover:border-indigo-400 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-gray-800">Imprimé en France</span>
              <span className="text-xs text-gray-500">Production locale et responsable</span>
            </div>
          </div>
          
          {/* Badge Qualité garantie */}
          <div className="group flex items-center space-x-3 transition-all duration-300 hover:translate-y-[-2px]">
            <div className="bg-white p-3 rounded-lg shadow-sm border border-indigo-200 group-hover:shadow-md group-hover:border-indigo-400 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-gray-800">Qualité garantie</span>
              <span className="text-xs text-gray-500">Satisfaction ou remboursé</span>
            </div>
          </div>
          
          {/* Badge Livraison rapide */}
          <div className="group flex items-center space-x-3 transition-all duration-300 hover:translate-y-[-2px]">
            <div className="bg-white p-3 rounded-lg shadow-sm border border-indigo-200 group-hover:shadow-md group-hover:border-indigo-400 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-gray-800">Livraison rapide</span>
              <span className="text-xs text-gray-500">Expédition sous 24-48h</span>
            </div>
          </div>
        </div>
        
        {/* Trustpilot à droite */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
          <div className="relative bg-white p-3 rounded-lg shadow-sm group-hover:shadow-md transition duration-300">
            <Image 
              src="/images/trustpilot.png" 
              alt="Trustpilot" 
              width={180} 
              height={45}
              className="h-auto w-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
