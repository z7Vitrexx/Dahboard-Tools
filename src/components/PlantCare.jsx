import React, { useState, useEffect, useRef } from 'react';
import { GiWateringCan, GiPlantSeed } from 'react-icons/gi';
import { BiFilterAlt, BiSortAlt2, BiImage } from 'react-icons/bi';
import { FiInfo } from 'react-icons/fi';

const PlantCare = ({ onClose }) => {
  const [plants, setPlants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [editingPlant, setEditingPlant] = useState(null);
  const fileInputRef = useRef();

  const emptyPlant = {
    name: '',
    type: '',
    waterInterval: 7,
    lastWatered: new Date().toISOString().split('T')[0],
    notes: '',
    image: null
  };

  const [newPlant, setNewPlant] = useState(emptyPlant);

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/plants');
      if (response.ok) {
        const data = await response.json();
        setPlants(data);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Pflanzen:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Konvertiere lastWatered in ein Date-Objekt und setze die Zeit auf 00:00:00
      const lastWateredDate = new Date(newPlant.lastWatered);
      lastWateredDate.setHours(0, 0, 0, 0);

      // Berechne nextWatering basierend auf lastWatered und waterInterval
      const nextWateringDate = new Date(lastWateredDate);
      nextWateringDate.setDate(nextWateringDate.getDate() + parseInt(newPlant.waterInterval));

      // Bereite die Pflanzendaten vor
      const plantData = {
        name: newPlant.name,
        type: newPlant.type,
        waterInterval: parseInt(newPlant.waterInterval),
        lastWatered: lastWateredDate.toISOString(),
        nextWatering: nextWateringDate.toISOString(),
        notes: newPlant.notes || '',
        image: newPlant.image ? newPlant.image.substring(0, 1024 * 1024) : null,
        healthStatus: 'healthy'
      };

      const url = editingPlant 
        ? `http://localhost:3001/api/plants/${editingPlant.id}`
        : 'http://localhost:3001/api/plants';
      
      const method = editingPlant ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plantData),
      });

      if (response.ok) {
        const savedPlant = await response.json();
        console.log(`${editingPlant ? 'Updated' : 'Saved'} plant:`, {
          ...savedPlant,
          image: savedPlant.image ? 'Base64 image data (truncated)' : null
        });
        fetchPlants();
        setNewPlant(emptyPlant);
        setShowForm(false);
        setEditingPlant(null);
      } else {
        const error = await response.text();
        console.error('Server error:', error);
      }
    } catch (error) {
      console.error('Fehler beim Speichern der Pflanze:', error);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Konvertiere das Bild in einen Base64-String
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64String = event.target.result;
          // Speichere nur den Base64-Teil (ohne den Data-URL-Header)
          const imageData = base64String.split(',')[1];
          setNewPlant(prev => ({
            ...prev,
            image: imageData
          }));
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Fehler beim Verarbeiten des Bildes:', error);
      }
    }
  };

  const handleEdit = (plant) => {
    setEditingPlant(plant);
    setNewPlant({
      name: plant.name,
      type: plant.type,
      waterInterval: plant.waterInterval,
      lastWatered: new Date(plant.lastWatered).toISOString().split('T')[0],
      notes: plant.notes || '',
      image: plant.image
    });
    setShowForm(true);
  };

  const handleWater = async (plantId) => {
    try {
      const plant = plants.find(p => p.id === plantId);
      if (!plant) return;

      // Setze lastWatered auf jetzt
      const lastWateredDate = new Date();
      lastWateredDate.setSeconds(0, 0); // Entferne Sekunden und Millisekunden

      // Berechne nextWatering
      const nextWateringDate = new Date(lastWateredDate);
      nextWateringDate.setDate(nextWateringDate.getDate() + parseInt(plant.waterInterval));

      const updateData = {
        ...plant,
        lastWatered: lastWateredDate.toISOString(),
        nextWatering: nextWateringDate.toISOString()
      };

      console.log('Updating plant:', updateData);

      const response = await fetch(`http://localhost:3001/api/plants/${plantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedPlant = await response.json();
        console.log('Updated plant:', updatedPlant);
        fetchPlants(); // Lade die Pflanzen neu
      } else {
        const error = await response.text();
        console.error('Server error:', error);
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Pflanze:', error);
    }
  };

  const handleDelete = async (plantId) => {
    if (window.confirm('Möchten Sie diese Pflanze wirklich löschen?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/plants/${plantId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchPlants(); // Lade die Pflanzen neu
        }
      } catch (error) {
        console.error('Fehler beim Löschen der Pflanze:', error);
      }
    }
  };

  const getFilteredAndSortedPlants = () => {
    let filtered = [...plants];
    
    if (filterStatus === 'due') {
      filtered = filtered.filter(plant => {
        const daysUntilWatering = plant.waterInterval - getDaysSinceWatering(plant.lastWatered);
        return daysUntilWatering <= 0;
      });
    } else if (filterStatus === 'upcoming') {
      filtered = filtered.filter(plant => {
        const daysUntilWatering = plant.waterInterval - getDaysSinceWatering(plant.lastWatered);
        return daysUntilWatering > 0 && daysUntilWatering <= 2;
      });
    }

    if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'dueDate') {
      filtered.sort((a, b) => {
        const aDays = a.waterInterval - getDaysSinceWatering(a.lastWatered);
        const bDays = b.waterInterval - getDaysSinceWatering(b.lastWatered);
        return aDays - bDays;
      });
    }

    return filtered;
  };

  const getDaysSinceWatering = (lastWatered) => {
    const today = new Date();
    const diffTime = Math.abs(today - new Date(lastWatered));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const renderImage = (imageData) => {
    if (!imageData) return null;
    try {
      return (
        <img
          src={`data:image/jpeg;base64,${imageData}`}
          alt="Pflanzenbild"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      );
    } catch (error) {
      console.error('Fehler beim Rendern des Bildes:', error);
      return null;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header-Bereich */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              setShowForm(true);
              setEditingPlant(null);
              setNewPlant(emptyPlant);
            }}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <GiPlantSeed className="mr-2" />
            Neue Pflanze
          </button>
          <div className="flex items-center space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">Alle Pflanzen</option>
              <option value="due">Gießen fällig</option>
              <option value="healthy">Gesund</option>
              <option value="needs_attention">Braucht Aufmerksamkeit</option>
            </select>
            <BiFilterAlt className="text-gray-500" />
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="name">Nach Name</option>
              <option value="nextWatering">Nach Gießdatum</option>
              <option value="type">Nach Typ</option>
            </select>
            <BiSortAlt2 className="text-gray-500" />
          </div>
        </div>
      </div>

      {/* Formular für neue/bearbeitete Pflanze */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {editingPlant ? 'Pflanze bearbeiten' : 'Neue Pflanze hinzufügen'}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPlant(null);
                    setNewPlant(emptyPlant);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name der Pflanze *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPlant.name}
                    onChange={(e) => setNewPlant({ ...newPlant, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="z.B. Monstera"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pflanzenart
                  </label>
                  <input
                    type="text"
                    value={newPlant.type}
                    onChange={(e) => setNewPlant({ ...newPlant, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="z.B. Zimmerpflanze"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gießintervall (Tage) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newPlant.waterInterval}
                    onChange={(e) => setNewPlant({ ...newPlant, waterInterval: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zuletzt gegossen
                  </label>
                  <input
                    type="date"
                    value={newPlant.lastWatered}
                    onChange={(e) => setNewPlant({ ...newPlant, lastWatered: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notizen
                  </label>
                  <textarea
                    value={newPlant.notes}
                    onChange={(e) => setNewPlant({ ...newPlant, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows="3"
                    placeholder="Zusätzliche Informationen zur Pflanze..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bild
                  </label>
                  <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-green-500 transition-colors">
                    <div className="space-y-1 text-center">
                      <BiImage className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                          <span>Bild hochladen</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                            ref={fileInputRef}
                          />
                        </label>
                        <p className="pl-1">oder hierher ziehen</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG bis zu 10MB</p>
                    </div>
                  </div>
                  {newPlant.image && (
                    <div className="mt-4">
                      {renderImage(newPlant.image)}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPlant(null);
                    setNewPlant(emptyPlant);
                  }}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingPlant ? 'Änderungen speichern' : 'Pflanze hinzufügen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pflanzenkarten-Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {getFilteredAndSortedPlants().map(plant => (
          <div key={plant.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              {plant.image ? (
                <div className="h-full w-full">
                  {renderImage(plant.image)}
                </div>
              ) : (
                <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                  <GiPlantSeed className="h-20 w-20 text-gray-300" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex space-x-2">
                <button
                  onClick={() => handleWater(plant.id)}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  title="Pflanze gießen"
                >
                  <GiWateringCan className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleEdit(plant)}
                  className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors"
                  title="Pflanze bearbeiten"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(plant.id)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Pflanze löschen"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{plant.name}</h3>
                  <p className="text-sm text-gray-600">{plant.type}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  plant.healthStatus === 'healthy' ? 'bg-green-100 text-green-800' :
                  plant.healthStatus === 'needs_attention' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {plant.healthStatus === 'healthy' ? 'Gesund' :
                   plant.healthStatus === 'needs_attention' ? 'Braucht Aufmerksamkeit' :
                   'Krank'}
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Gießintervall:</span> {plant.waterInterval} Tage
                </p>
                <p className="text-sm">
                  <span className="font-medium">Zuletzt gegossen:</span> {new Date(plant.lastWatered).toLocaleDateString()}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Nächstes Gießen:</span> {new Date(plant.nextWatering).toLocaleDateString()}
                </p>
                {plant.notes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{plant.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlantCare;
