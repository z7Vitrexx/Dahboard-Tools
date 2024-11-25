const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Settings = sequelize.define('Settings', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    appName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    settings: {
      type: DataTypes.JSON,
      // Speichert app-spezifische Einstellungen als JSON
      // z.B. für Weather: { defaultCity: 'Berlin', units: 'metric' }
      // für Calendar: { defaultView: 'month', workingHours: { start: 9, end: 17 } }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    position: {
      type: DataTypes.INTEGER,
      // Für die Reihenfolge der Apps im Dashboard
    },
    theme: {
      type: DataTypes.JSON,
      // App-spezifische Farbeinstellungen und Themes
      // z.B. { primary: '#4A90E2', secondary: '#2C3E50' }
    },
    permissions: {
      type: DataTypes.JSON,
      // App-spezifische Berechtigungen
      // z.B. { notifications: true, location: false }
    }
  });

  return Settings;
};
