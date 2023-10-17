const express = require('express');
const app = express();
const port = 5555;

// TODO: Can this all be cached locally? Or should it use an external cache?
// TODO: Should we try updating in an actual database or should we edit the csv in-place?
// TODO: Prepopulate data as needed

app.get('/api/population/state/:state/city/:city', (req, res) => {
  res.send('Hello, World!');
});

app.put('/api/population/state/:state/city/:city', (req, res) => {
  res.send('Put');
});

app.listen(port, () => {
  console.log(`Population Service listening on port ${port}`);
});
