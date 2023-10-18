jest.mock('../../../../src/webapp/population/population-db');
let PopulationService;
const PopulationDb = require('../../../../src/webapp/population/population-db');

let db;
beforeAll(() => {
  PopulationService = require('../../../../src/webapp/population/population-service');
  expect(PopulationDb).toHaveBeenCalledTimes(1);
  db = PopulationDb.mock.instances[0];
});

beforeEach(() => {
  jest.resetAllMocks();
});

describe('init', () => {
  it('Populates an empty db', async () => {
    db.count.mockResolvedValue(0);
    await PopulationService.init();
    expect(db.insert).toHaveBeenCalled();
  });

  it('Does not populate a prepopulated db', async () => {
    db.count.mockResolvedValue(123);
    await PopulationService.init();
    expect(db.insert).not.toHaveBeenCalled();
  });
});

describe('getPopulation', () => {
  it('fetches from the db when value is not cached', async () => {
    const expectedValue = 12321;
    db.get.mockResolvedValue(expectedValue);
    const value = await PopulationService.getPopulation('any','where');
    expect(value).toBe(expectedValue);
  });

  it('fetches from cache when available', async () => {
    const state = 'florida';
    const city = 'orlando';
    const expectedValue = 987;
    await PopulationService.setPopulation(state, city, expectedValue);
    db.get.mockClear();
    const value = await PopulationService.getPopulation(state, city);
    expect(value).toBe(expectedValue);
    expect(db.get).not.toHaveBeenCalled();
  });
});

describe('setPopulation', () => {
  const state = 'virginia';
  const city = 'virginia beach';
  const population = 555444;

  it('inserts a new value when it does not already exist in db', async () => {
    const result = await PopulationService.setPopulation(state, city, population);
    expect(result?.created).toBe(true);
    expect(db.insert).toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalled();
  });

  it('does not update the db when the same value already exists', async () => {
    db.get.mockResolvedValue(population);
    const result = await PopulationService.setPopulation(state, city, population);
    expect(result?.created).toBe(false);
    expect(db.insert).not.toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalled();
  });

  it('updates the db when a different value already exists', async () => {
    db.get.mockResolvedValue(population * 2);
    const result = await PopulationService.setPopulation(state, city, population);
    expect(result?.created).toBe(false);
    expect(db.insert).not.toHaveBeenCalled();
    expect(db.update).toHaveBeenCalled();
  });
});
