require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const { initializeDatabase } = require('./src/database/init');
const db = require('./src/database/models');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// Erhöhe die maximale Anfragegröße auf 10MB
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Initialisiere die Datenbank
initializeDatabase().catch(console.error);

// Dummy-Antworten für den Test-Modus
const dummyResponses = [
  "Ich verstehe Ihre Frage. Lassen Sie mich darüber nachdenken...",
  "Das ist eine interessante Frage! Hier ist meine Antwort...",
  "Basierend auf den verfügbaren Informationen würde ich sagen...",
  "Hier ist eine mögliche Lösung für Ihr Problem...",
  "Das ist ein komplexes Thema. Lassen Sie es mich erklären..."
];

// Root-Route
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>ChatGPT API Server (Test Mode)</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 40px auto; 
            padding: 20px;
          }
          .endpoint {
            background: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
          }
          .mode-badge {
            background: #ffd700;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 14px;
            margin-left: 10px;
          }
        </style>
      </head>
      <body>
        <h1>ChatGPT API Server <span class="mode-badge">Test Mode</span></h1>
        <p>Server is running in test mode with dummy responses.</p>
        
        <div class="endpoint">
          <h3>GET /api/test</h3>
          <p>Test endpoint to check if server is running</p>
          <a href="/api/test">Test the API</a>
        </div>
        
        <div class="endpoint">
          <h3>POST /api/chat</h3>
          <p>Send chat messages (currently returning test responses)</p>
          <code>
            POST /api/chat<br>
            Content-Type: application/json<br>
            {<br>
              &nbsp;&nbsp;"message": "Your message here"<br>
            }
          </code>
        </div>
      </body>
    </html>
  `);
});

// Test-Route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is running (Test Mode)',
    timestamp: new Date().toISOString()
  });
});

// Chat-Route
app.post('/api/chat', async (req, res) => {
  try {
    console.log('Received chat request:', req.body);
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        error: 'Message is required',
        status: 'error'
      });
    }

    // Zufällige Antwort aus den Dummy-Antworten auswählen
    const randomResponse = dummyResponses[Math.floor(Math.random() * dummyResponses.length)];
    
    // Simuliere eine Verzögerung für realistischeres Verhalten
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Sending dummy response');
    res.json({ 
      message: randomResponse + "\n\nHinweis: Dies ist eine Test-Antwort, da der OpenAI API-Key nicht verfügbar ist.",
      status: 'success'
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
      status: 'error'
    });
  }
});

// Kalender-Routen
app.get('/api/calendar/events', async (req, res) => {
  try {
    console.log('GET /api/calendar/events');
    const events = await db.Calendar.findAll();
    console.log('Found events:', events);
    res.json(events);
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({ error: 'Interner Serverfehler', details: error.message });
  }
});

app.post('/api/calendar/events', async (req, res) => {
  try {
    console.log('POST /api/calendar/events', req.body);
    const event = await db.Calendar.create(req.body);
    console.log('Created event:', event);
    res.json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Interner Serverfehler', details: error.message });
  }
});

app.put('/api/calendar/events/:id', async (req, res) => {
  try {
    console.log('PUT /api/calendar/events/:id', { id: req.params.id, body: req.body });
    const event = await db.Calendar.findByPk(req.params.id);
    if (!event) {
      console.log('Event not found');
      return res.status(404).json({ error: 'Event nicht gefunden' });
    }
    const updatedEvent = await event.update(req.body);
    console.log('Updated event:', updatedEvent);
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Interner Serverfehler', details: error.message });
  }
});

app.delete('/api/calendar/events/:id', async (req, res) => {
  try {
    console.log('DELETE /api/calendar/events/:id', req.params.id);
    const event = await db.Calendar.findByPk(req.params.id);
    if (!event) {
      console.log('Event not found');
      return res.status(404).json({ error: 'Event nicht gefunden' });
    }
    await event.destroy();
    console.log('Event deleted');
    res.json({ message: 'Event erfolgreich gelöscht' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Interner Serverfehler', details: error.message });
  }
});

// API-Routen für Pflanzenpflege
app.get('/api/plants', async (req, res) => {
  try {
    console.log('GET /api/plants');
    const plants = await db.PlantCare.findAll();
    console.log('Found plants:', plants);
    res.json(plants);
  } catch (error) {
    console.error('Error getting plants:', error);
    res.status(500).json({ error: 'Interner Serverfehler', details: error.message });
  }
});

app.post('/api/plants', async (req, res) => {
  try {
    console.log('POST /api/plants', req.body);
    const plant = await db.PlantCare.create(req.body);
    console.log('Created plant:', plant);
    res.json(plant);
  } catch (error) {
    console.error('Error creating plant:', error);
    res.status(500).json({ error: 'Interner Serverfehler', details: error.message });
  }
});

app.put('/api/plants/:id', async (req, res) => {
  try {
    console.log('PUT /api/plants/:id', { id: req.params.id, body: req.body });
    const plant = await db.PlantCare.findByPk(req.params.id);
    if (!plant) {
      console.log('Plant not found');
      return res.status(404).json({ error: 'Pflanze nicht gefunden' });
    }
    const updatedPlant = await plant.update(req.body);
    console.log('Updated plant:', updatedPlant);
    res.json(updatedPlant);
  } catch (error) {
    console.error('Error updating plant:', error);
    res.status(500).json({ error: 'Interner Serverfehler', details: error.message });
  }
});

app.delete('/api/plants/:id', async (req, res) => {
  try {
    console.log('DELETE /api/plants/:id', req.params.id);
    const plant = await db.PlantCare.findByPk(req.params.id);
    if (!plant) {
      console.log('Plant not found');
      return res.status(404).json({ error: 'Pflanze nicht gefunden' });
    }
    await plant.destroy();
    console.log('Plant deleted');
    res.json({ message: 'Pflanze erfolgreich gelöscht' });
  } catch (error) {
    console.error('Error deleting plant:', error);
    res.status(500).json({ error: 'Interner Serverfehler', details: error.message });
  }
});

// API-Routen für Wetter
app.get('/api/weather/:city', async (req, res) => {
  try {
    const weather = await db.Weather.findOne({
      where: { city: req.params.city },
      order: [['timestamp', 'DESC']]
    });
    res.json(weather);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/weather', async (req, res) => {
  try {
    const weather = await db.Weather.create(req.body);
    res.json(weather);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running in TEST MODE at http://localhost:${PORT}`);
  console.log(`Test the API at http://localhost:${PORT}/api/test`);
});
