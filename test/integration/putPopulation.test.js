const { v4: uuid } = require('uuid');
const { put } = require('../util');

describe('Tests the PUT population endpoint', () => {
  it('puts a new value', async () => {
    const result = await put(uuid(), uuid(), 9876);
    expect(result?.statusCode).toBe(201);
  });

  it('overwrites an existing value', async () => {
    const state = 'state';
    const city = 'city';
    const population = 1234;
    const result1 = await put(state, city, population);
    expect(result1?.statusCode).not.toBe(400);
    const result2 = await put(state, city, population * 2);
    expect(result2?.statusCode).toBe(200);
  });

  it('sends invalid data', async () => {
    const result = await put('state', 'city');
    expect(result?.statusCode).toBe(400);
  });
});
