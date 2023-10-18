const axios = require('axios');

const BASEURL = 'http://localhost:5555';

/**
 *
 * @param {string} state
 * @param {string} city
 * @returns {Promise<{population: number|undefined, statusCode: number}>}
 */
async function get(state, city) {
  try {
    const result = (await axios.get(`${BASEURL}/api/population/state/${state}/city/${city}`));
    return { population: result?.data?.population, statusCode: result.status };
  } catch (e) {
    return { population: undefined, statusCode: e.response.status };
  }
}

/**
 * @param {string} state
 * @param {string} city
 * @param {number} population
 * @returns {Promise<{ statusCode: number }>} Status code returned by the PUT operation
 */
async function put(state, city, population) {
  try {
    const url = `${BASEURL}/api/population/state/${state}/city/${city}`;
    const result = (await axios.put(
        url,
        population?.toString(),
        { headers: { 'Content-Type': 'text/plain' } },
    ));
    return { statusCode: result.status };
  } catch (e) {
    return { statusCode: e.response.status };
  }
}

module.exports = {
  BASEURL,
  get,
  put,
};
