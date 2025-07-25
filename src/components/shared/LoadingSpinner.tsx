import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
    </div>
  );
};

export default LoadingSpinner;