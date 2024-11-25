import React from 'react';
import CleaningSchedule from './components/CleaningSchedule';

function CleaningApp() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Putzplan</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <CleaningSchedule />
        </div>
      </div>
    </div>
  );
}

export default CleaningApp;
