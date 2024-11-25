const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../data/dashboard.sqlite'),
  logging: false
});

const db = {
  sequelize,
  Sequelize
};

// Importiere die Modelle
db.Weather = require('./weather')(sequelize);
db.Calendar = require('./calendar')(sequelize);
db.PlantCare = require('./plantcare')(sequelize);
db.Statistics = require('./statistics')(sequelize);
db.Settings = require('./settings')(sequelize);

// Definiere die Beziehungen zwischen den Modellen
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
