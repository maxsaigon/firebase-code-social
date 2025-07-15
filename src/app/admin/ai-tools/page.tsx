'use client';

import React from 'react';
import { ServiceOptimizer } from '@/components/service-optimizer';

export default function AiToolsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Tools</h1>
        <p className="text-gray-600">Leverage AI to enhance your service descriptions.</p>
      </div>
      <ServiceOptimizer />
    </div>
  );
}