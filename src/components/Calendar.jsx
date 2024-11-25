import React, { useState, useCallback, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { de } from 'date-fns/locale';

const locales = {
  'de': de,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const eventCategories = [
  { id: 'meeting', label: 'Meeting', color: '#4169E1' },
  { id: 'appointment', label: 'Termin', color: '#2ECC71' },
  { id: 'reminder', label: 'Erinnerung', color: '#F1C40F' },
  { id: 'deadline', label: 'Deadline', color: '#E74C3C' },
  { id: 'other', label: 'Sonstiges', color: '#95A5A6' }
];

const Calendar = ({ onClose }) => {
  const [events, setEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    category: 'appointment',
    allDay: false,
    start: new Date(),
    end: new Date()
  });

  // Lade Events beim Start
  useEffect(() => {
    console.log('Lade Events...');
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      console.log('Fetching events from server...');
      const response = await fetch('http://localhost:3001/api/calendar/events');
      console.log('Server response:', response);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Received events:', data);
        
        const formattedEvents = data.map(event => {
          console.log('Formatting event:', event);
          return {
            id: event.id,
            title: event.title,
            description: event.description || '',
            start: new Date(event.startDate),
            end: new Date(event.endDate),
            category: event.category || 'appointment',
            allDay: event.allDay || false
          };
        });
        
        console.log('Formatted events:', formattedEvents);
        setEvents(formattedEvents);
      } else {
        const errorText = await response.text();
        console.error('Server error:', errorText);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const handleSelectSlot = useCallback((slotInfo) => {
    console.log('Selected slot:', slotInfo);

    // Setze Start auf 00:00 Uhr des ausgewählten Tages
    const start = new Date(slotInfo.start);
    start.setHours(0, 0, 0, 0);

    // Setze Ende auf 00:00 Uhr des nächsten Tages
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const newEventData = {
      title: '',
      description: '',
      category: 'appointment',
      allDay: true,
      start,
      end
    };

    console.log('New event data:', newEventData);
    setNewEvent(newEventData);
    setIsEditing(false);
    setSelectedEvent(null);
    setShowEventForm(true);
  }, []);

  const handleSelectEvent = useCallback((event) => {
    console.log('Selected event:', event);
    setIsEditing(true);
    setSelectedEvent(event);
    setNewEvent({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end)
    });
    setShowEventForm(true);
  }, []);

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    console.log('Saving event...');
    console.log('Current state:', { newEvent, isEditing, selectedEvent });

    try {
      const eventData = {
        title: newEvent.title,
        description: newEvent.description || '',
        startDate: newEvent.start.toISOString(),
        endDate: newEvent.end.toISOString(),
        category: newEvent.category || 'appointment',
        allDay: newEvent.allDay || false
      };

      console.log('Event data to send:', eventData);

      const url = isEditing && selectedEvent
        ? `http://localhost:3001/api/calendar/events/${selectedEvent.id}`
        : 'http://localhost:3001/api/calendar/events';

      console.log('Request URL:', url);

      const response = await fetch(url, {
        method: isEditing && selectedEvent ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      console.log('Server response:', response);

      if (response.ok) {
        const savedEvent = await response.json();
        console.log('Saved event:', savedEvent);

        const formattedEvent = {
          id: savedEvent.id,
          title: savedEvent.title,
          description: savedEvent.description || '',
          start: new Date(savedEvent.startDate),
          end: new Date(savedEvent.endDate),
          category: savedEvent.category || 'appointment',
          allDay: savedEvent.allDay || false
        };

        if (isEditing && selectedEvent) {
          setEvents(prevEvents => 
            prevEvents.map(event => 
              event.id === selectedEvent.id ? formattedEvent : event
            )
          );
        } else {
          setEvents(prevEvents => [...prevEvents, formattedEvent]);
        }

        setShowEventForm(false);
        setSelectedEvent(null);
        setNewEvent({
          title: '',
          description: '',
          category: 'appointment',
          allDay: false,
          start: new Date(),
          end: new Date()
        });
      } else {
        const errorText = await response.text();
        console.error('Error saving event:', errorText);
      }
    } catch (error) {
      console.error('Error in handleSaveEvent:', error);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    console.log('Deleting event:', selectedEvent);

    if (window.confirm('Möchten Sie diesen Termin wirklich löschen?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/calendar/events/${selectedEvent.id}`, {
          method: 'DELETE'
        });

        console.log('Delete response:', response);

        if (response.ok) {
          setEvents(prevEvents => 
            prevEvents.filter(event => event.id !== selectedEvent.id)
          );
          setShowEventForm(false);
          setSelectedEvent(null);
        } else {
          const errorText = await response.text();
          console.error('Error deleting event:', errorText);
        }
      } catch (error) {
        console.error('Error in handleDeleteEvent:', error);
      }
    }
  };

  return (
    <div style={{ height: '100%' }}>
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        selectable
        culture="de"
        step={30}
        timeslots={1}
        defaultView="month"
        views={['month', 'week', 'day']}
        min={new Date(0, 0, 0, 7, 0, 0)}
        max={new Date(0, 0, 0, 22, 0, 0)}
        style={{ height: 'calc(100% - 16px)' }}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: eventCategories.find(cat => cat.id === event.category)?.color || '#4169E1'
          }
        })}
        messages={{
          next: "Weiter",
          previous: "Zurück",
          today: "Heute",
          month: "Monat",
          week: "Woche",
          day: "Tag",
          date: "Datum",
          time: "Zeit",
          event: "Termin",
          noEventsInRange: "Keine Termine in diesem Zeitraum"
        }}
      />

      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                  isEditing ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'
                }`}>
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d={isEditing 
                        ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        : "M12 6v6m0 0v6m0-6h6m-6 0H6"
                      } 
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {isEditing ? 'Termin bearbeiten' : 'Neuer Termin'}
                </h3>
              </div>
              <button
                onClick={() => setShowEventForm(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-lg p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  placeholder="z.B. Meeting mit Team"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
                <div className="grid grid-cols-5 gap-3">
                  {eventCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewEvent({ ...newEvent, category: cat.id })}
                      className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                        newEvent.category === cat.id
                          ? 'ring-2 ring-offset-2 ring-blue-500'
                          : 'hover:bg-gray-50'
                      }`}
                      style={{
                        backgroundColor: newEvent.category === cat.id ? cat.color + '20' : 'transparent'
                      }}
                    >
                      <div
                        className="w-6 h-6 rounded-full mb-1"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-xs text-gray-600">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  rows="3"
                  placeholder="Zusätzliche Details zum Termin"
                />
              </div>

              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="allDay"
                  checked={newEvent.allDay}
                  onChange={(e) => setNewEvent({ ...newEvent, allDay: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allDay" className="ml-2 block text-sm text-gray-900">
                  Ganztägig
                </label>
              </div>

              {!newEvent.allDay && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                    <input
                      type="datetime-local"
                      value={format(newEvent.start, "yyyy-MM-dd'T'HH:mm")}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        if (!isNaN(date.getTime())) {
                          setNewEvent(prev => {
                            const end = new Date(date);
                            end.setHours(end.getHours() + 1);
                            return {
                              ...prev,
                              start: date,
                              end: prev.end <= date ? end : prev.end
                            };
                          });
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ende</label>
                    <input
                      type="datetime-local"
                      value={format(newEvent.end, "yyyy-MM-dd'T'HH:mm")}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        if (!isNaN(date.getTime())) {
                          setNewEvent(prev => ({
                            ...prev,
                            end: date
                          }));
                        }
                      }}
                      min={format(newEvent.start, "yyyy-MM-dd'T'HH:mm")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-6 border-t">
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleDeleteEvent}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    Löschen
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowEventForm(false)}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  {isEditing ? 'Speichern' : 'Erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
