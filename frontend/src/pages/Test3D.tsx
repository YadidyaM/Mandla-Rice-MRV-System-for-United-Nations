import React from 'react';
import CarbonCredit3D from '../components/ui/CarbonCredit3D';

const Test3D: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          3D Carbon Credit Visualization Test
        </h1>
        <div className="bg-gray-800 rounded-lg p-4">
          <CarbonCredit3D />
        </div>
      </div>
    </div>
  );
};

export default Test3D;
