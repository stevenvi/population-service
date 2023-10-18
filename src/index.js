const express = require('express');
const app = express();
const port = 5555;

const PopulationService = require('./population-service');
PopulationService.init();

app.use(express.text());


// TODO: Can this all be cached locally? Or should it use an external cache?
// TODO: Should we try updating in an actual database or should we edit the csv in-place?
// TODO: Prepopulate data as needed

// TODO: Is this the cleanest way to handle params?
app.param('state', (req, res, next, state) => {
  req.state = state.trim();
  next();
});
app.param('city', (req, res, next, city) => {
  req.city = city.trim();
  next();
});

app.get('/api/population/state/:state/city/:city', async (req, res) => {
  if (!req.city?.length || !req.state?.length) {
    res.status(400).send('asdf');
    return;
  }

  const population = await PopulationService.getPopulation(req.state, req.city);
  console.log(`State: ${req.state}, City: ${req.city}, Pop: ${population}`)
  if (population === undefined) {
    res.status(400).send('TODO: Invalid city');
    return;
  }

  res.status(200).json({ population });
});

app.put('/api/population/state/:state/city/:city', async (req, res) => {
  console.log(req.body);
  // todo: validate body is numeric
  const value = req.body;
  const result = await PopulationService.setPopulation(req.state, req.city, value);
  if (result.update) res.status(200);
  else res.status(201);
  res.send();
});



// Only start listening after all data is loaded and external connections are opened
app.listen(port, () => {
  console.log(`Population Service listening on port ${port}`);
});
