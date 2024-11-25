const db = require('./models');

async function initializeDatabase() {
  try {
    // Teste die Datenbankverbindung
    await db.sequelize.authenticate();
    console.log('Datenbankverbindung erfolgreich hergestellt.');

    // Synchronisiere die Modelle mit der Datenbank (force: true löscht existierende Tabellen)
    await db.sequelize.sync({ force: true });
    console.log('Datenbank wurde synchronisiert.');

    // Füge Standardeinstellungen für die Apps hinzu
    await initializeDefaultSettings();

  } catch (error) {
    console.error('Fehler bei der Datenbankinitialisierung:', error);
    throw error;
  }
}

async function initializeDefaultSettings() {
  try {
    // Erstelle die Finance-Tabelle
    await db.Finance.sync({ force: true });
    console.log('Finance-Tabelle wurde erstellt');

    // Erstelle die Budget-Tabelle
    await db.Budget.sync({ force: true });
    console.log('Budget-Tabelle wurde erstellt');

    // Erstelle die anderen Tabellen
    await db.Weather.sync({ force: true });
    await db.Calendar.sync({ force: true });
    await db.PlantCare.sync({ force: true });
    await db.Statistics.sync({ force: true });
    await db.Settings.sync({ force: true });
    
    console.log('Alle Tabellen wurden erfolgreich erstellt');
  } catch (error) {
    console.error('Fehler beim Erstellen der Tabellen:', error);
    throw error;
  }
}

module.exports = {
  initializeDatabase
};
