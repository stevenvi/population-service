const fs = require('fs');

const data = new Map();

function init() {
  // First iteration: we're just going to load the data into a map
  const csv = fs.readFileSync('./data/city_populations.csv', 'utf-8')
      .split('\n')
      .filter(Boolean)
      .forEach(line => {
        const columns = line.split(',').map(str => str.trim());
        const city = columns[0];
        const state = columns[1];
        const population = columns[2];
        data.set(getKey(state, city), population);
      });

  console.log(`Read ${data.size} city populations`);
}

/**
 * Generates a unique key for a state/city combo.
 * @param {string} state State component of the key
 * @param {string} city City component of the Key
 * @return {string} a key that will be distinct for each unique input
 */
function getKey(state, city) {
  // For now we're doing a simple concatenation. This is likely to be faster
  // than generating a hash or doing any other trickery (state abbreviations, etc)
  return `${state},${city}`.toLowerCase();
}

function decomposeKey(key) {
  return key.split(',');
}

// Marked as async to allow for the use of external data stores down the line
async function getPopulation(state, city) {
  return data.get(getKey(state, city));
}

async function setPopulation(state, city, value) {
  // TODO: This is not complete! We are only storing in-memory right now!!!
  const key = getKey(state, city);
  const ret = { update: data.has(key) };
  data.set(getKey(state, city), value);
  await writeDatabase();
  return ret;
}

async function writeDatabase() {
  // writing this way takes ~1s on my machine, this is NOT feasible!
  // do we want to do this in a proper db then?
  const path = './data/database.csv';
  fs.writeFileSync(path, '');
  data.forEach((value, key) => {
    const stateCity = decomposeKey(key);
    fs.appendFileSync(path, `${stateCity[1]},${stateCity[0]},${value}\n`);
  });
}

module.exports = {
  init,
  getPopulation,
  setPopulation
};
