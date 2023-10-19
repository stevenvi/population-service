const PopulationService = require('./population/population-service');

/** HTTP status codes. Could also use a dependency to provide this. */
const StatusCodes = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
};

/**
 * Validates that the input state and city are valid. If not, an error is sent to the caller.
 * @param {string} state
 * @param {string} city
 * @param {import('express').Response} res
 * @returns {boolean} true if the input was valid, false otherwise
 */
function validateStateCity(state, city, res) {
  if (!state?.length) {
    res.status(StatusCodes.BAD_REQUEST).send('Invalid state provided');
    return false;
  } else if (!city?.length) {
    res.status(StatusCodes.BAD_REQUEST).send('Invalid city provided');
    return false;
  }

  return true;
}

/**
 * Validates that a population value is valid. If not, an error is sent to the caller.
 * @param {*} population
 * @param {import('express').Response} res
 * @returns {number|undefined} the population converted to its numeric counterpart if needed, or undefined on error.
 */
function validateAndParsePopulation(population, res) {
  // Validate body is numeric
  const populationValue = parseInt(population);
  if (isNaN(populationValue)) {
    res.status(StatusCodes.BAD_REQUEST).send('Input must be numeric');
    return;
  }

  // Validate value is non-negative
  if (populationValue < 0) {
    res.status(StatusCodes.BAD_REQUEST).send('Input must be greater than or equal to 0');
    return;
  }

  return populationValue;
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function getPopulation(req, res) {
  // Validate inputs
  const { state, city } = req.params;
  if (!validateStateCity(state, city, res)) {
    return;
  }

  // Get data
  const population = await PopulationService.getPopulation(state, city);
  if (population === undefined) {
    res.status(StatusCodes.BAD_REQUEST).send('Unknown city');
  } else {
    res.status(StatusCodes.OK).send({ population });
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function setPopulation(req, res) {
  // Validate inputs
  const { state, city } = req.params;
  if (!validateStateCity(state, city, res)) {
    return;
  }

  const population = validateAndParsePopulation(req.body, res);
  if (population === undefined || population === null) {
    res.status(StatusCodes.BAD_REQUEST);
    return;
  }

  const result = await PopulationService.setPopulation(state, city, population);
  if (result.created) {
    res.status(StatusCodes.CREATED);
  } else {
    res.status(StatusCodes.OK);
  }

  res.send();
}

module.exports = {
  getPopulation,
  setPopulation,
};
