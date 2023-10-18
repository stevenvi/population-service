const { v4: uuid } = require('uuid');
const { get, put } = require('../util');
const { readDefaultData } = require('../../src/webapp/population/population-service');

async function benchmark(label, operation, ...args) {
    let startTime = Date.now();
    const expectedStopTime = startTime + 1000;
    let actualStopTime;
    let count = 0;
    while ((actualStopTime = Date.now()) < expectedStopTime) {
        const evaluatedArgs = args.map(arg => arg(count));
        await operation.call(null, ...evaluatedArgs);
        count++;
    }
    const avgCallTime = (actualStopTime - startTime) / count;
    console.log(`${label} avg time per call: ${avgCallTime} ms (${count} calls in ${actualStopTime - startTime} ms)`);
    return count;
}

const initialData = readDefaultData();
const keys = Object.keys(initialData);
const states = keys.map(key => key.split(',')[0]);
const cities = keys.map(key => key.split(',')[1]);

const getState = (pos) => states[pos % keys.length];
const getCity = (pos) => cities[pos % keys.length];

const getState2 = (pos) => pos % 2 ? uuid() : getState(pos);
const getCity2 = (pos) => pos % 2 ? uuid() : getCity(pos);

const randomPopulation = () => Math.random() * 1e7;


describe('Tests performance of GET operations on the API', () => {
    it('gets nonexisting data', async () => {
        await benchmark('GET nonexisting data', get, uuid, uuid);
    });

    it('gets values that should exist', async () => {
        await benchmark('GET existing data', get, getState, getCity);
    });

    it('gets a combination of existing and nonexisting values', async () => {
        await benchmark('GET existing and nonexisting data', get, getState2, getCity2);
    });
})

describe('Tests performance of PUT operations on the API', () => {
    it('overwrites the same value', async () => {
        await benchmark('PUT overwriting data', put, getState, getCity, randomPopulation);
    });

    it('writes distinct values', async () => {
        await benchmark('PUT new data', put, uuid, uuid, randomPopulation);
    });

    it('writes both new and existing values', async () => {
        await benchmark('PUT new and overwriting data', put, getState2, getCity2, randomPopulation);
    });
})

describe('Tests combined GET/PUT operations on the API', () => {
    it('does everything', async () => {
        let doGet = false;
        const func = (...args) => {
            doGet = !doGet;
            if (doGet) return get(...args);
            else return put(...args);
        }

        const getState3 = (pos) => pos % 4 < 2 ? uuid() : getState(pos);
        const getCity3 = (pos) => pos % 4 < 2 ? uuid() : getCity(pos);
        await benchmark('GETs and PUTs real and invalid data', func, getState3, getCity3, randomPopulation);
    });
});
