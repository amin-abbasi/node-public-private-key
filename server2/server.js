const app = require('./app')
const { red, green, cyan } = require('colors')

const { SERVER_PROTOCOL, SERVER_HOST, SERVER_PORT, NODE_ENV } = process.env

// listen on the designated port found in the configuration
app.listen(SERVER_PORT || 4000, err => {
  if (err) { console.info('SERVER ERROR: ', red(err)); process.exit(1) }

  // output the status of the app in the terminal
  const url = `${SERVER_PROTOCOL || 'http'}://${SERVER_HOST || 'localhost'}:${SERVER_PORT || 4000}`
  console.info(green(`App is now running on ${cyan(url)} in ${NODE_ENV || 'development'} mode`))
})