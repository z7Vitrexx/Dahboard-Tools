const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PlantCare = sequelize.define('PlantCare', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING
    },
    waterInterval: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    lastWatered: {
      type: DataTypes.DATE,
      allowNull: false
    },
    nextWatering: {
      type: DataTypes.DATE,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT
    },
    image: {
      type: DataTypes.STRING // Pfad zum Bild
    },
    wateringHistory: {
      type: DataTypes.JSON,
      // Speichert den Gießverlauf als JSON
      // z.B. [{ date: '2023-05-20', amount: 200 }]
    },
    healthStatus: {
      type: DataTypes.ENUM('healthy', 'needs_attention', 'sick'),
      defaultValue: 'healthy'
    }
  });

  PlantCare.associate = (models) => {
    PlantCare.hasMany(models.Statistics, {
      foreignKey: 'plantId',
      as: 'statistics'
    });
  };

  return PlantCare;
};
