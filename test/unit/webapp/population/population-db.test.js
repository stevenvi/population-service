const PopulationDatabase = require('../../../../src/webapp/population/population-db');

const newDb = () => new PopulationDatabase(true);
const newInitDb = async () => newDb().init();

const DB_NOT_INITIALIZED = 'Database must be initialized';
describe('count', () => {
  it('Throws for uninitialized databases', async() => {
    const db = newDb();
    await expect(async () => db.count()).rejects.toThrow(DB_NOT_INITIALIZED);
  });

  it('counts correctly as data is added', async() => {
    const db = await newInitDb();
    expect(await db.count()).toBe(0);
    for (var i = 1; i < 1000; i++) {
      await db.insert(`key${i}`, i);
      expect(await db.count()).toBe(i);
    }
  });
});

describe('get', () => {
  it('throws for uninitialized databases', async() => {
    const db = newDb();
    await expect(async () => db.get('myKey')).rejects.toThrow(DB_NOT_INITIALIZED);
  });

  it('returns undefined for invalid keys', async() => {
    const db = await newInitDb();
    const value = await db.get('myKey');
    expect(value).toBeUndefined();
  });

  it('returns expected value for valid keys', async() => {
    const db = await newInitDb();
    const key = 'myKey';
    const value = 10293847756;
    await db.insert(key, value);
    const output = await db.get(key);
    expect(output).toBe(value);
  });
});

describe('insert', () => {
  it('throws for uninitialized databases', async () => {
    const db = newDb();
    await expect(async () => db.insert('myKey', 123)).rejects.toThrow(DB_NOT_INITIALIZED);
  });

  it('inserts a new key', async () => {
    const db = await newInitDb();
    const result = await db.insert('myKey', 123);
    expect(result?.changes).toBe(1);
  });

  it('throws on duplicate key errors', async () => {
    const db = await newInitDb();
    const result = await db.insert('myKey', 123);
    expect(result?.changes).toBe(1);
    await expect(async () => db.insert('myKey', 456)).rejects.toThrow('UNIQUE constraint failed');
  });

  it('throws on invalid key', async () => {
    const db = await newInitDb();
    await expect(async () => db.insert(undefined, 123)).rejects.toThrow('NOT NULL constraint failed');
  });

  it('throws on invalid value', async () => {
    const db = await newInitDb();
    await expect(async () => db.insert('myKey', undefined)).rejects.toThrow('NOT NULL constraint failed');
  });
});

describe('update', () => {
  it('throws for uninitialized values', async () => {
    const db = newDb();
    await expect(async () => db.update('myKey', 123)).rejects.toThrow(DB_NOT_INITIALIZED);
  });

  it('does nothing for keys that do not exist', async () => {
    const db = await newInitDb();
    const result = await db.update('myKey', 123);
    expect(result.changes).toBe(0);
  });

  it('updates for a preexisting key', async () => {
    const db = await newInitDb();
    const key = 'myKey';
    await db.insert(key, 123);
    const newValue = 456;
    const result = await db.update(key, newValue);
    expect(result.changes).toBe(1);
    const getResult = await db.get(key);
    expect(getResult).toBe(newValue);
  });

  it('does nothing for invalid key', async () => {
    const db = await newInitDb();
    const result = await db.update(undefined, 123);
    expect(result.changes).toBe(0);
  });

  it('throws for invalid value', async () => {
    const db = await newInitDb();
    const key = 'myKey';
    await db.insert(key, 123);
    await expect(async () => db.update(key, undefined)).rejects.toThrow('NOT NULL constraint failed');
  });
});
