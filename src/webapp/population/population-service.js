const fs = require('fs');
const { LRUCache } = require('lru-cache');
const PopulationDatabase = require('./population-db');

const cacheOptions = {
  max: 40000,
  maxSize: 64 * 1024 * 1024,
  sizeCalculation: (value, key) => key.length + 8,
  updateAgeOnGet: true,
};

/** Cache of most recently used population values */
const cache = new LRUCache(cacheOptions);
/** Db for long-term storage of population values */
const db = new PopulationDatabase();

/**
 * Reads the default population data from the supplied CSV file.
 * @returns {object} key:value pairs of each unique state and city pair to its population
 */
function readDefaultData() {
  return fs.readFileSync('./data/city_populations.csv', 'utf-8')
    .split('\n')
    .filter(Boolean)
    .reduce((a, v) => {
      const columns = v.split(',').map(str => str.trim());
      const city = columns[0];
      const state = columns[1];
      const population = columns[2];
      const key = getKey(state, city);
      a[key] = population;
      return a;
    }, {});
}

/** Initializes this module */
async function init() {
  console.log('Initializing population service');
  await db.init();

  // If db is empty, prepopulate it from csv and cache values locally
  let dbCount = await db.count();
  if (!dbCount) {
    console.log('DB is empty, will populate from CSV. This will take a brief moment...');
    const defaultData = readDefaultData();
    Object.entries(defaultData)
      .forEach(entry => {
        const [key, population] = entry;
        cache.set(key, population);
      });

    await db.insertMany(defaultData);
    dbCount = await db.count();
    console.log(`Db has been populated with ${dbCount} entries`);
  }
}

/**
 * Generates a unique key for a state/city combo.
 * @param {string} state State component of the key
 * @param {string} city City component of the Key
 * @returns {string} a key that will be distinct for each unique input
 */
function getKey(state, city) {
  // For now we're doing a simple concatenation. This is likely to be faster
  // than generating a hash or doing any other trickery.
  return `${state},${city}`.toLowerCase();
}

/**
 * Gets the population of a city in a state
 * @param {string} state
 * @param {string} city
 * @returns {Promise<number|undefined>} the population of the specified input city
 */
async function getPopulation(state, city) {
  // Check cache first
  const key = getKey(state, city);
  const cachedValue = cache.get(key);
  if (cachedValue !== undefined) {
    return cachedValue;
  }

  // Load from db instead and then cache it
  const dbValue = db.get(key);
  if (dbValue !== undefined) {
    cache.set(key, dbValue);
  }

  return dbValue;
}

/**
 * Sets the population of a city in a state
 * @param {string} state
 * @param {string} city
 * @param {number} population
 * @returns {Promise<{created: boolean}>} Denotes if an entry was created (true) or updated (false)
 */
async function setPopulation(state, city, population) {
  const key = getKey(state, city);

  const dbValue = await db.get(key);
  if (dbValue === population) {
    // No update is needed, just return immediately
    return { created: false };
  } else if (dbValue === undefined) {
    // Not in db, need to add it
    await db.insert(key, population);
    cache.set(key, population);
    return { created: true };
  } else {
    // Already in the db with a different value, need to update it
    await db.update(key, population);
    cache.set(key, population);
    return { created: false };
  }
}

module.exports = {
  getPopulation,
  init,
  readDefaultData,
  setPopulation,
};
