'use client';

import React from 'react';
import Image from 'next/image';

type TechniqueModalProps = {
  isOpen: boolean;
  onClose: () => void;
  technique: {
    title: string;
    image: string;
    description: string;
    details: string;
    advantages: string[];
    useCases: string[];
  };
};

export default function TechniqueModal({ isOpen, onClose, technique }: TechniqueModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-2xl leading-6 font-bold text-gray-900 mb-4" id="modal-title">
                  {technique.title}
                </h3>
                
                <div className="relative h-56 mb-4">
                  <Image
                    src={technique.image}
                    alt={technique.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-700 mb-4">
                    {technique.description}
                  </p>
                  
                  <p className="text-gray-700 mb-4">
                    {technique.details}
                  </p>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-lg mb-2">Avantages :</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {technique.advantages.map((advantage, index) => (
                        <li key={index} className="text-gray-700">{advantage}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Applications idéales :</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {technique.useCases.map((useCase, index) => (
                        <li key={index} className="text-gray-700">{useCase}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
