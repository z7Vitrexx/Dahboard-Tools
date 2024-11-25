const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Calendar = sequelize.define('Calendar', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: 'default'
    },
    allDay: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    recurrence: {
      type: DataTypes.JSON,
      // Speichert Wiederholungsregeln als JSON
      // z.B. { frequency: 'weekly', interval: 1, weekdays: [1,3,5] }
    },
    reminders: {
      type: DataTypes.JSON,
      // Speichert Erinnerungen als JSON
      // z.B. [{ type: 'email', minutes: 30 }, { type: 'popup', minutes: 10 }]
    }
  });

  Calendar.associate = (models) => {
    Calendar.hasMany(models.Statistics, {
      foreignKey: 'calendarId',
      as: 'statistics'
    });
  };

  return Calendar;
};
