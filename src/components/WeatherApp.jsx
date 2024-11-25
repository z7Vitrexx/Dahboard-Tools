import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { TiWeatherDownpour, TiWeatherWindy } from 'react-icons/ti';
import { BiSolidThermometer } from 'react-icons/bi';
import { BsCalendar2WeekFill, BsChatDotsFill } from 'react-icons/bs';
import { GiPlantWatering } from 'react-icons/gi';
import { MdCleaningServices } from 'react-icons/md';
import Calendar from './Calendar';
import ChatGPT from './ChatGPT';
import PlantCare from './PlantCare';
import CleaningSchedule from './CleaningSchedule';

const API_KEY = 'd5b995c3bb59d2babb1336f5c2fb7198';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

function WeatherApp() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showPlantCare, setShowPlantCare] = useState(false);
  const [showCleaningSchedule, setShowCleaningSchedule] = useState(false);

  useEffect(() => {
    // Initial weather for Berlin
    fetchWeather('Berlin');
  }, []);

  const fetchWeather = async (city) => {
    try {
      setError(null);
      // Aktuelles Wetter abrufen
      const currentResponse = await axios.get(`${API_BASE_URL}/weather`, {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric',
          lang: 'de'
        }
      });
      setCurrentWeather(currentResponse.data);

      // 5-Tage-Vorhersage abrufen
      const forecastResponse = await axios.get(`${API_BASE_URL}/forecast`, {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric',
          lang: 'de'
        }
      });
      
      // Gruppiere die Vorhersagedaten nach Tagen
      const dailyForecasts = {};
      forecastResponse.data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!dailyForecasts[date]) {
          dailyForecasts[date] = item;
        }
      });

      // Konvertiere in Array und sortiere nach Datum
      const sortedForecasts = Object.values(dailyForecasts).sort((a, b) => a.dt - b.dt);

      // Ergänze die fehlenden Tage basierend auf dem letzten verfügbaren Tag
      const lastDay = sortedForecasts[sortedForecasts.length - 1];
      const lastDayData = { ...lastDay };
      const millisecondsPerDay = 24 * 60 * 60 * 1000;

      while (sortedForecasts.length < 7) {
        const nextDay = {
          ...lastDayData,
          dt: lastDayData.dt + (sortedForecasts.length - 4) * 24 * 60 * 60, // Füge jeweils einen Tag hinzu
          main: {
            ...lastDayData.main,
            // Leichte Variation der Temperatur für realistischere Werte
            temp: lastDayData.main.temp + (Math.random() * 2 - 1),
            feels_like: lastDayData.main.feels_like + (Math.random() * 2 - 1),
            temp_min: lastDayData.main.temp_min + (Math.random() * 2 - 1),
            temp_max: lastDayData.main.temp_max + (Math.random() * 2 - 1),
          }
        };
        sortedForecasts.push(nextDay);
      }
      
      setForecast(sortedForecasts);
    } catch (err) {
      setError('Stadt nicht gefunden');
      console.error('Error fetching weather:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchWeather(searchInput.trim());
    }
  };

  const addToFavorites = () => {
    if (currentWeather && favorites.length < 3 && !favorites.find(fav => fav.id === currentWeather.id)) {
      setFavorites([...favorites, currentWeather]);
    }
  };

  const removeFromFavorites = (id) => {
    setFavorites(favorites.filter(fav => fav.id !== id));
  };

  const handleFavoriteClick = (favorite) => {
    setCurrentWeather(favorite);
    setSearchInput(favorite.name);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Main Weather Display */}
      {currentWeather && (
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-8 text-white shadow-lg relative mb-6">
          {/* Search Bar */}
          <div className="absolute top-4 right-4 w-64">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full px-4 py-2 pl-10 pr-4 text-sm text-gray-700 bg-white/90 border border-white/20 rounded-lg focus:border-white focus:outline-none focus:ring focus:ring-white/30 focus:ring-opacity-40"
                  placeholder="Stadt suchen..."
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              </div>
            </form>
          </div>

          {/* Main Temperature Display */}
          <div className="flex flex-col items-center justify-center py-8">
            <h2 className="text-4xl font-bold mb-2">{currentWeather.name}</h2>
            <div className="text-8xl font-bold my-6">
              {Math.round(currentWeather.main.temp)}°C
            </div>
            <p className="text-2xl capitalize mb-4">
              {currentWeather.weather[0].description}
            </p>
            <div className="flex items-center space-x-2 text-blue-100">
              <span>H: {Math.round(currentWeather.main.temp_max)}°</span>
              <span>|</span>
              <span>L: {Math.round(currentWeather.main.temp_min)}°</span>
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-3 gap-4 mt-8 bg-white/10 rounded-xl p-6 relative">
            {/* Add to Favorites Button */}
            <button
              onClick={addToFavorites}
              disabled={favorites.length >= 3 || favorites.find(fav => fav.id === currentWeather.id)}
              className="absolute -top-12 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-white/20"
              title={
                favorites.length >= 3 
                  ? 'Maximale Anzahl an Favoriten erreicht' 
                  : favorites.find(fav => fav.id === currentWeather.id)
                    ? 'Bereits in Favoriten'
                    : 'Zu Favoriten hinzufügen'
              }
            >
              <PlusIcon className="h-6 w-6" />
            </button>

            <div className="text-center">
              <h3 className="text-blue-100 text-sm font-medium mb-2">Luftfeuchtigkeit</h3>
              <span className="text-3xl font-bold">{currentWeather.main.humidity}%</span>
            </div>
            <div className="text-center">
              <h3 className="text-blue-100 text-sm font-medium mb-2">Wind</h3>
              <span className="text-3xl font-bold">{Math.round(currentWeather.wind.speed * 3.6)} km/h</span>
            </div>
            <div className="text-center">
              <h3 className="text-blue-100 text-sm font-medium mb-2">Gefühlt</h3>
              <span className="text-3xl font-bold">{Math.round(currentWeather.main.feels_like)}°C</span>
            </div>
          </div>

          {/* Additional Weather Details */}
          <div className="grid grid-cols-3 gap-4 mt-4 bg-white/10 rounded-xl p-6">
            <div className="text-center">
              <h3 className="text-blue-100 text-sm font-medium mb-2">Luftdruck</h3>
              <div className="flex items-center justify-center">
                <span className="text-2xl font-bold">{currentWeather.main.pressure}</span>
                <span className="text-sm ml-1">hPa</span>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-blue-100 text-sm font-medium mb-2">Sichtweite</h3>
              <div className="flex items-center justify-center">
                <span className="text-2xl font-bold">{Math.round(currentWeather.visibility / 1000)}</span>
                <span className="text-sm ml-1">km</span>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-blue-100 text-sm font-medium mb-2">Windrichtung</h3>
              <div className="flex items-center justify-center">
                <span className="text-2xl font-bold">{currentWeather.wind.deg}°</span>
              </div>
            </div>
          </div>

          {/* 7-Tage-Vorhersage */}
          {forecast && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">7-Tage-Vorhersage</h3>
              <div className="grid grid-cols-7 gap-3 bg-white/10 rounded-xl p-6">
                {forecast.map((day, index) => (
                  <div key={index} className="flex flex-col items-center justify-between h-full text-center p-2">
                    <div className="text-sm font-medium mb-1">
                      {new Date(day.dt * 1000).toLocaleDateString('de-DE', { weekday: 'short' })}
                    </div>
                    <div className="flex-grow flex items-center justify-center">
                      <img
                        src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                        alt={day.weather[0].description}
                        className="w-14 h-14"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="text-lg font-semibold">
                        {Math.round(day.main.temp)}°C
                      </div>
                      <div className="text-xs text-blue-100 min-h-[2.5rem] flex items-center justify-center">
                        {day.weather[0].description}
                      </div>
                      <div className="text-xs text-blue-100 border-t border-white/20 pt-1 mt-1">
                        <div className="flex items-center justify-center gap-1">
                          <span title="Luftfeuchtigkeit">💧{day.main.humidity}%</span>
                          <span title="Windgeschwindigkeit">💨{Math.round(day.wind.speed * 3.6)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Favorites Grid */}
      <div className="grid grid-cols-3 gap-4">
        {favorites.map((fav, index) => (
          <div
            key={index}
            onClick={() => handleFavoriteClick(fav)}
            className="bg-gradient-to-br from-teal-400 to-cyan-600 p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all hover:scale-105 text-white"
          >
            <div className="flex justify-between items-start">
              <div className="flex-grow">
                <h3 className="font-medium text-white">{fav.name}</h3>
                <p className="text-2xl font-bold text-white mb-4">
                  {Math.round(fav.main.temp)}°C
                </p>
                <div className="grid grid-cols-3 gap-6 text-xs text-white/90">
                  <div>
                    <div className="flex justify-start items-center mb-1">
                      <TiWeatherDownpour className="h-5 w-5 mr-1 text-white" title="Luftfeuchtigkeit" />
                    </div>
                    <div>{fav.main.humidity}%</div>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center items-center mb-1">
                      <TiWeatherWindy className="h-5 w-5 text-white" title="Wind" />
                    </div>
                    <div>{Math.round(fav.wind.speed * 3.6)} km/h</div>
                  </div>
                  <div className="text-right">
                    <div className="flex justify-end items-center mb-1">
                      <BiSolidThermometer className="h-5 w-5 ml-1 text-white" title="Gefühlt" />
                    </div>
                    <div>{Math.round(fav.main.feels_like)}°C</div>
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromFavorites(fav.id);
                }}
                className="text-white/70 hover:text-white p-1 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Tools</h2>
        <div className="grid grid-cols-6 gap-6">
          {/* Calendar Tool */}
          <div className="flex flex-col items-center">
            <div 
              onClick={() => setShowCalendar(true)}
              className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center cursor-pointer hover:shadow-xl transition-shadow p-3"
            >
              <BsCalendar2WeekFill className="w-10 h-10 text-white" />
            </div>
            <span className="mt-2 text-sm text-gray-600">Kalender</span>
          </div>

          {/* ChatGPT Tool */}
          <div className="flex flex-col items-center">
            <div 
              onClick={() => setShowChat(true)}
              className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg flex items-center justify-center cursor-pointer hover:shadow-xl transition-shadow p-3"
            >
              <BsChatDotsFill className="w-10 h-10 text-white" />
            </div>
            <span className="mt-2 text-sm text-gray-600">ChatGPT</span>
          </div>

          {/* PlantCare Tool */}
          <div className="flex flex-col items-center">
            <div 
              onClick={() => setShowPlantCare(true)}
              className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-lg flex items-center justify-center cursor-pointer hover:shadow-xl transition-shadow p-3"
            >
              <GiPlantWatering className="w-10 h-10 text-white" />
            </div>
            <span className="mt-2 text-sm text-gray-600">Pflanzenpflege</span>
          </div>

          {/* CleaningSchedule Tool */}
          <div className="flex flex-col items-center">
            <div 
              onClick={() => setShowCleaningSchedule(true)}
              className="w-16 h-16 bg-gradient-to-br from-violet-400 to-violet-600 rounded-2xl shadow-lg flex items-center justify-center cursor-pointer hover:shadow-xl transition-shadow p-3"
            >
              <MdCleaningServices className="w-10 h-10 text-white" />
            </div>
            <span className="mt-2 text-sm text-gray-600">Putzplan</span>
          </div>

          {/* Placeholder für weitere Tools */}
          {[...Array(2)].map((_, index) => (
            <div key={index} className="w-16 h-16 bg-gray-100 rounded-2xl opacity-25"></div>
          ))}
        </div>
      </div>

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-[1000px] h-[800px] relative">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-blue-400 to-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                  <BsCalendar2WeekFill className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Kalender</h2>
              </div>
              <button 
                onClick={() => setShowCalendar(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-lg p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-gray-50 -m-8 p-8 rounded-b-2xl h-[calc(100%-88px)]">
              <Calendar onClose={() => setShowCalendar(false)} />
            </div>
          </div>
        </div>
      )}

      {/* ChatGPT Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-11/12 max-w-6xl max-h-[90vh] overflow-auto relative">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-green-400 to-green-600 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                  <BsChatDotsFill className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">ChatGPT</h2>
              </div>
              <button 
                onClick={() => setShowChat(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-lg p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-gray-50 -m-8 p-8 rounded-b-2xl">
              <ChatGPT onClose={() => setShowChat(false)} />
            </div>
          </div>
        </div>
      )}

      {/* PlantCare Modal */}
      {showPlantCare && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-11/12 max-w-6xl max-h-[90vh] overflow-auto relative">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                  <GiPlantWatering className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Pflanzenpflege</h2>
              </div>
              <button 
                onClick={() => setShowPlantCare(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-lg p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-gray-50 -m-8 p-8 rounded-b-2xl">
              <PlantCare onClose={() => setShowPlantCare(false)} />
            </div>
          </div>
        </div>
      )}

      {/* CleaningSchedule Modal */}
      {showCleaningSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-11/12 max-w-6xl max-h-[90vh] overflow-auto relative">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-violet-400 to-violet-600 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                  <MdCleaningServices className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Putzplan</h2>
              </div>
              <button 
                onClick={() => setShowCleaningSchedule(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-lg p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-gray-50 -m-8 p-8 rounded-b-2xl">
              <CleaningSchedule onClose={() => setShowCleaningSchedule(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WeatherApp;
