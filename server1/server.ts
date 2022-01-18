import app from './app'
import { green, cyan } from 'colors'

const { SERVER_PROTOCOL, SERVER_HOST, SERVER_PORT, NODE_ENV } = process.env

// listen on the designated port found in the configuration
app.listen(SERVER_PORT || 4000, () => {
  const url = `${SERVER_PROTOCOL || 'http'}://${SERVER_HOST || 'localhost'}:${SERVER_PORT || 4000}`
  console.info(green(`App is now running on ${cyan(url)} in ${NODE_ENV || 'development'} mode`))
})
