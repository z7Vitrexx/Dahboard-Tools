const db = require('./models');

async function initializeDatabase() {
  try {
    // Teste die Datenbankverbindung
    await db.sequelize.authenticate();
    console.log('Datenbankverbindung erfolgreich hergestellt.');

    // Synchronisiere die Modelle mit der Datenbank
    await db.sequelize.sync({ alter: true });
    console.log('Datenbank wurde synchronisiert.');

    // Füge Standardeinstellungen für die Apps hinzu
    await initializeDefaultSettings();

  } catch (error) {
    console.error('Fehler bei der Datenbankinitialisierung:', error);
  }
}

async function initializeDefaultSettings() {
  const defaultApps = [
    {
      appName: 'Weather',
      settings: {
        defaultCity: 'Berlin',
        units: 'metric',
        updateInterval: 30 // Minuten
      },
      position: 1,
      theme: {
        primary: '#4A90E2',
        secondary: '#2C3E50'
      }
    },
    {
      appName: 'Calendar',
      settings: {
        defaultView: 'month',
        workingHours: {
          start: 9,
          end: 17
        },
        firstDayOfWeek: 1 // Montag
      },
      position: 2,
      theme: {
        primary: '#2ECC71',
        secondary: '#27AE60'
      }
    },
    {
      appName: 'PlantCare',
      settings: {
        notificationTime: '09:00',
        reminderDays: 1, // Tage vor dem Gießen
        defaultWaterInterval: 7
      },
      position: 3,
      theme: {
        primary: '#27AE60',
        secondary: '#229954'
      }
    }
  ];

  for (const app of defaultApps) {
    await db.Settings.findOrCreate({
      where: { appName: app.appName },
      defaults: app
    });
  }
}

module.exports = {
  initializeDatabase
};
