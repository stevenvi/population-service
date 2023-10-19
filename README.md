# population-service

A demo service making use of Express.js, sqlite3, and local caching to provide an API for city population values. Because this depends on a local database, it cannot be horizontally scaled without special configuration. Config is hardcoded for convenience of development.

## Running
This service requires Node 18. This can be installed with nvm:
```
$ nvm install 18
$ nvm use 18
```

* `npm install` will fetch dependencies
* `npm start` starts the service. If it is the first time running, the initial data csv will be parsed and stored in a sqlite3 database for persistence. The service listens on port `5555`.

## Endpoints
Two endpoints are provided:
### Get population
`GET /api/population/state/:state/city/:city`

Example:
```
$ curl 'http://localhost:5555/api/population/state/alabama/city/marion'
{"population":3178}%
```

### Set population
`PUT /api/population/state/:state/city/:city`

Example:
```
$ curl --request PUT 'http://localhost:5555/api/population/state/illinois/city/chicago' \
--header 'Content-Type: text/plain' \
--data '1234567'
```

  
## Tests
### Unit Tests
Unit tests are included in the `test/unit` directory and can be run with `npm test`.

### Integration Tests
While a proper integration testing suite would be more appropriate for this sort of thing, simple integration testing is included in the `test/integration` directory, and can be run with `npm run integration-test`. Note that this requires an instance of the server to already be running on the same host.

### Load Tests
Again, a proper load testing suite would be more appropriate for this sort of thing, and a simple contrived load test is provided in the `test/load` directory. This can be run with `npm run load-test`. Note that this requires an instance of the server to already be running on the same host.

Results will be skewed based on how data is cached. This is not a definitive performance measurement.

Some results from load testing on different platforms:
| CPU | OS | Read Rate | Write Rate | Mixed Rate |
|-----|----|-----------|------------|------------|
| Apple M1 | MacOS 13 | 1502/s | 1511/s | 1457/s |
| Intel(R) Core(TM) i5-13600K | Linux 6.1 | 4571/s | 4409/s | 4183/s |
| Intel(R) Core(TM) i5-13600K | Windows 11 | 1886/s | 1903/s | 1904/s |

The performance contrast between Windows and Linux is interesting but will not be investigated at this time.
