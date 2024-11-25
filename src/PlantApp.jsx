import React from 'react';
import PlantCare from './components/PlantCare';

function PlantApp() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Pflanzenpflege</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <PlantCare />
        </div>
      </div>
    </div>
  );
}

export default PlantApp;
