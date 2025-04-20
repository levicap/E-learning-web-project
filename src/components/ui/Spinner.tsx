// src/components/ui/spinner.tsx
import React from 'react';

const Spinner: React.FC<{ size?: 'sm' | 'lg' }> = ({ size = 'lg' }) => {
  const sizeClass = size === 'sm' ? 'w-6 h-6' : 'w-12 h-12';
  return (
    <div className={`border-t-4 border-blue-500 border-solid rounded-full animate-spin ${sizeClass}`}></div>
  );
};

export default Spinner;
