const Database = require('better-sqlite3');

const DB_FILE = './data/db.sqlite3';
const TABLE_NAME = 'population';

/**
 * Handles connections and common operations with the population database
 */
class PopulationDatabase {
  /**
   * @param {boolean} inMemoryOnly If set to true, an in-memory db will be created
   *    instead of a persistent db on disk.
   */
  constructor(inMemoryOnly = false) {
    // Connect to sqlite db
    this._db = new Database(inMemoryOnly ? ':memory:' : DB_FILE);
  }

  /** Initializes and creates the database and table as needed. Should be called before using any other class function */
  async init() {
    // Create population table if it does not already exist
    const checkIfTableExists = this._db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='${TABLE_NAME}'`);
    let tableExists = await checkIfTableExists.get();
    if (tableExists === undefined) {
      // Table needs to be created
      await this._db.exec(`CREATE TABLE ${TABLE_NAME} (key text not null primary key, population int not null)`);

      // Confirm it exists now
      tableExists = await checkIfTableExists.get();
      if (tableExists.name !== TABLE_NAME) {
        throw new Error('Population table was not created');
      }
    }

    // Create prepared statements
    this._getPopulation = this._db.prepare(`SELECT population FROM ${TABLE_NAME} WHERE key=?`);
    this._updatePopulation = this._db.prepare(`UPDATE ${TABLE_NAME} SET population=? where key=?`);
    this._insertPopulation = this._db.prepare(`INSERT INTO ${TABLE_NAME} (key, population) VALUES (?,?)`);
    this._countRows = this._db.prepare(`SELECT count(key) FROM ${TABLE_NAME}`);

    return this;
  }

  /**
   * Gets the population for a given key.
   * @param {string} key Key for the population row to fetch
   * @returns {number|undefined} The population for this key, or undefined if
   *    the value is not in the database.
   */
  async get(key) {
    this.checkInitialized();
    const result = await this._getPopulation.get(key);
    if (!result) {
      return undefined;
    }

    const values = Object.values(result);
    if (!values.length) {
      return undefined;
    } else {
      return values[0];
    }
  }

  /**
   * Updates a row in the population table. Throws if row does not exist.
   * @param {string} key Key for the row to be updated
   * @param {number} population New value for this row
   * @returns {Promise<{ changes: number }>}
   */
  async update(key, population) {
    this.checkInitialized();
    return this._updatePopulation.run(population, key);
  }

  /**
   * Inserts a row into the population table. Throws on duplicate key error.
   * @param {string} key Key for this row
   * @param {number} population Value for this row
   * @returns {Promise<{ changes: number }>}
   */
  async insert(key, population) {
    this.checkInitialized();
    return this._insertPopulation.run(key, population);
  }

  /**
   * Bulk inserts data into the db
   * @param {object} obj key:value pairs for the population database
   * @returns {Promise<*>}
   */
  async insertMany(obj) {
    this.checkInitialized();
    const txn = this._db.transaction(obj => {
      for (const [key, population] of Object.entries(obj)) {
        this._insertPopulation.run(key, population);
      }
    });
    return txn(obj);
  }

  /** @returns {number} Total number of rows in the population table  */
  async count() {
    this.checkInitialized();
    const result = await this._countRows.get();
    const values = Object.values(result);
    if (!values.length) {
      return 0;
    } else {
      return values[0];
    }
  }

  /** @throws {Error} if the instance is not properly initialized */
  checkInitialized() {
    if (!this._countRows) {
      throw new Error('Database must be initialized before using it');
    }
  }
}

module.exports = PopulationDatabase;
