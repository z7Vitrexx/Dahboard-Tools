import React from 'react';
import WeatherApp from './components/WeatherApp';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
        
        {/* Weather App */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <WeatherApp />
        </div>
      </div>
    </div>
  );
}

export default App;
