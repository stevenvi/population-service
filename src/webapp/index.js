const Fastify = require('fastify');
const { getPopulation, setPopulation } = require('./endpoints');
const PopulationService = require('./population/population-service');

const PORT = 5555;
const fastify = Fastify();

// Define endpoints
fastify.get('/api/population/state/:state/city/:city', getPopulation);
fastify.put('/api/population/state/:state/city/:city', setPopulation);

/** Initializes the webapp module */
async function init() {
  await PopulationService.init();
  try {
    await fastify.listen({ port: PORT} );
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
  console.log(`Initializing webapp on port ${PORT}`);
}

module.exports = {
  init,
};
