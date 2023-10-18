// Here we will orchestrate connecting to all infrastructure and loading any
// prerequisite data prior to listening for HTTP requests. In a larger ecosystem
// there should be a common library to handle this more gracefully. Here I am
// just demonstrating the idea of how it should work without building a full
// implementation.

const WebApp = require('./webapp');
WebApp.init().then(() => {
  console.log('Population Service is ready to use');
})


// TODO: Should I add in a catch-all handler here? I don't personally mind node just crashing if I made a mistake...
