// Import npm modules
const express = require('express')
const crypto  = require('crypto')
const fetch   = require('node-fetch')
const fs      = require('fs')
const { celebrate, Joi, errors } = require('celebrate')

require('dotenv').config()

// Initialize App & it's Middlewares
const app = express()
app.use(express.urlencoded({ extended: true }))    // parse application/x-www-form-urlencoded
app.use(express.json())                            // parse application/json

// ---------------------------------- Key Pair -----------------------------------
const server2PublicKey = fs.readFileSync('./key-pair/public2.pem', 'utf-8')
const myPrivateKey = fs.readFileSync('./key-pair/private1.pem', 'utf-8')

// ---------------------------------- Logger Config -----------------------------------
const { transports, format } = require('winston')
const { logger } = require('express-winston')
app.use( logger({
  transports: [new transports.Console()],
  format: format.combine(
    format.colorize(),
    format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
    format.json(),
    format.printf((info) => `[${info.timestamp}] ${JSON.stringify(info.meta.req)} ------ ${JSON.stringify(info.meta.res)} ${info.level}: ${info.message}`)
  ),
  meta: true,
  expressFormat: true,
  colorize: true,
}) )


// ---------------------------------- Function ----------------------------------
async function restAPI(data) {
  const encryptedData = crypto.publicEncrypt(
    { key: server2PublicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
    Buffer.from(JSON.stringify(data))
  )
  const body = JSON.stringify({ data: encryptedData.toString('base64') })
  const url = `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/action`
  const option = {
    body,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }
  const result = await fetch(url, option)
  const response = await result.json()
  return response
}

// -------------------------------------- Routes -------------------------------------
// Health-check Endpoint
app.get('/health', celebrate({ query: {} }), (req, res) => { res.send(`${res.statusCode}`) })

// Send an encrypted message
const validation = celebrate({
  body: {
    data: Joi.object({
      action: Joi.string().required().valid('add', 'multiply', 'divide', 'reduce').description('Action Types'),
      var1: Joi.number().required().description('Variable 1'),
      var2: Joi.number().required().description('Variable 2'),
    }).required().description('Object Data'),
  },
  query: {}
})
app.post('/action', validation, async (req, res, next) => {
  try {
    const data = req.body.data
    const result = await restAPI(data)
    res.send({ success: true, result })
  } catch (error) {
    console.log('Error: ', error)
    res.send({ success: false, error })
  }
})

// Use Celebrate to validate routes
app.use(errors())

module.exports = app
