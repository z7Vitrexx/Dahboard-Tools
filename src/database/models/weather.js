const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Weather = sequelize.define('Weather', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    temperature: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    humidity: {
      type: DataTypes.INTEGER
    },
    windSpeed: {
      type: DataTypes.FLOAT
    },
    description: {
      type: DataTypes.STRING
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  Weather.associate = (models) => {
    Weather.hasMany(models.Statistics, {
      foreignKey: 'weatherId',
      as: 'statistics'
    });
  };

  return Weather;
};
