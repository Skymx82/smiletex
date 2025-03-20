'use client';

import React from 'react';
import Image from 'next/image';

export default function TrustBadge() {
  return (
    <div className="flex justify-center items-center py-4 bg-white border-b border-gray-200">
      <Image 
        src="/images/trustpilot.png" 
        alt="Trustpilot" 
        width={200} 
        height={50}
        className="h-auto w-auto"
      />
    </div>
  );
}
