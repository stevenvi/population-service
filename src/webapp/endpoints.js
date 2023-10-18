const PopulationService = require('./population/population-service');

const OK = 200;
const CREATED = 201;
const BAD_REQUEST = 400;

function validateStateCity(state, city, res) {
  if (!state?.length) {
    res.status(BAD_REQUEST).send('Invalid state provided');
    return false;
  } else if (!city?.length) {
    res.status(BAD_REQUEST).send('Invalid city provided');
    return false;
  }
  return true;
}

function validateAndParsePopulation(population, res) {
  // Validate body is numeric
  if (isNaN(population)) {
    res.status(BAD_REQUEST).send('Input must be numeric');
    return;
  }

  // Validate value is non-negative
  const populationValue = parseInt(population);
  if (populationValue < 0) {
    res.status(BAD_REQUEST).send('Input must be greater than or equal to 0');
    return;
  }

  return populationValue;
}

async function getPopulation(req, res) {
  // Validate inputs
  const { state, city } = req.params;
  if (!validateStateCity(state, city, res)) {
    return;
  }

  // Get data
  const population = await PopulationService.getPopulation(state, city);
  if (population === undefined) {
    res.status(BAD_REQUEST).send('Unknown city');
  } else {
    res.status(OK).json({ population });
  }
}

async function setPopulation(req, res) {
  // Validate inputs
  const { state, city } = req.params;
  if (!validateStateCity(state, city, res)) {
    return;
  }
  const population = validateAndParsePopulation(req.body, res);
  if (population === undefined) {
    return;
  }

  const result = await PopulationService.setPopulation(state, city, population);
  if (result.created) {
    res.status(CREATED);
  } else {
    res.status(OK);
  }
  res.send();
}

module.exports = {
  getPopulation,
  setPopulation,
};
