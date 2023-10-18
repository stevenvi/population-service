const { get, put } = require('../util');

describe('Tests the GET population enpdoint', () => {
  it('gets data that exists', async () => {
    const expectedValue = 100200;
    await put('florida', 'orlando', expectedValue);
    const result = await get('florida', 'orlando');
    expect(result).toBeDefined();
    expect(result.population).toBe(expectedValue);
    expect(result.statusCode).toBe(200);
  });

  it('fails to get data that does not exist', async () => {
    const result = await get('not-a-valid-state', 'not-a-valid-city');
    expect(result).toBeDefined();
    expect(result.population).toBeUndefined();
    expect(result.statusCode).toBe(400);
  })
});
