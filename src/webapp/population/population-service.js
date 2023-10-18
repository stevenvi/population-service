const fs = require('fs');
const { LRUCache } = require('lru-cache');
const PopulationDatabase = require('./population-db');

const cacheOptions = {
  max: 40000,
  maxSize: 64 * 1024 * 1024,
  sizeCalculation: (value, key) => key.length + 4,
  updateAgeOnGet: true,
};

const cache = new LRUCache(cacheOptions);
const db = new PopulationDatabase();

async function init() {
  console.log(`Initializing population service`);
  await db.init();

  // If db is empty, prepopulate it from csv and cache values locally
  let dbCount = await db.count();
  if (!dbCount) {
    console.log('DB is empty, will populate from CSV. This will take a brief moment...');
    const csv = fs.readFileSync('./data/city_populations.csv', 'utf-8')
        .split('\n')
        .filter(Boolean)
        .forEach(line => {
          const columns = line.split(',').map(str => str.trim());
          const city = columns[0];
          const state = columns[1];
          const population = columns[2];
          cache.set(getKey(state, city), population);
        });
    console.log(`Read ${cache.size} city populations from CSV...`);

    cache.forEach(async (value, key) => {
      await db.insert(key, value);
    });
    dbCount = await db.count();
    console.log(`Db has been populated with ${dbCount} entries`);
  }
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
  const key = getKey(state, city);
  const cachedValue = cache.get(key);
  if (cachedValue !== undefined) return cachedValue;

  // Load from db instead and then cache it
  const dbValue = db.get(key);
  if (dbValue !== undefined) {
    cache.set(key, dbValue);
  }

  return dbValue;
}

async function setPopulation(state, city, value) {
  const key = getKey(state, city);

  const dbValue = await db.get(key);
  if (dbValue === value) {
    // No update is needed, just return immediately
    return { created: false };
  } else if (dbValue === undefined) {
    // Not in db, need to add it
    await db.insert(key, value);
    cache.set(key, value);
    return { created: true };
  } else {
    // Already in the db with a different value, need to update it
    await db.update(key, value);
    cache.set(key, value);
    return { created: false };
  }
}

module.exports = {
  init,
  getPopulation,
  setPopulation
};
