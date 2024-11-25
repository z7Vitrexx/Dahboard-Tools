const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Statistics = sequelize.define('Statistics', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    appName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    eventType: {
      type: DataTypes.STRING,
      allowNull: false
      // z.B. 'view', 'create', 'update', 'delete'
    },
    eventData: {
      type: DataTypes.JSON,
      // Speichert zusätzliche Eventdaten als JSON
    },
    userId: {
      type: DataTypes.STRING
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    weatherId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Weather',
        key: 'id'
      }
    },
    calendarId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Calendar',
        key: 'id'
      }
    },
    plantId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'PlantCare',
        key: 'id'
      }
    }
  });

  Statistics.associate = (models) => {
    Statistics.belongsTo(models.Weather, {
      foreignKey: 'weatherId',
      as: 'weather'
    });
    Statistics.belongsTo(models.Calendar, {
      foreignKey: 'calendarId',
      as: 'calendar'
    });
    Statistics.belongsTo(models.PlantCare, {
      foreignKey: 'plantId',
      as: 'plant'
    });
  };

  return Statistics;
};
