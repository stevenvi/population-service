const express = require('express');
const { getPopulation, setPopulation } = require('./endpoints');
const PopulationService = require('./population/population-service');

const PORT = 5555;
const app = express();

// Configure express to parse plain text request bodies
app.use(express.text());

// Define endpoints
app.get('/api/population/state/:state/city/:city', getPopulation);
app.put('/api/population/state/:state/city/:city', setPopulation);

/** Initializes the webapp module */
async function init() {
  await PopulationService.init();

  // Only start listening after all data is loaded and external connections are
  // opened. In a larger ecosystem we would likely have a common library for
  // managing this, but in this small example it is all self-contained by the
  // PopulationService above.
  return new Promise(resolve => {
    app.listen(PORT, () => {
      console.log(`Initializing webapp on port ${PORT}`);
      resolve();
    });
  });
}

module.exports = {
  init,
};
