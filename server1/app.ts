// Import npm modules
import express, { Request, Response } from 'express'
import crypto  from 'crypto'
import fs      from 'fs'
import path    from 'path'
import dotenv  from 'dotenv'
import fetch, { RequestInit } from 'node-fetch'
import { celebrate, Joi, errors } from 'celebrate'

// Initialize App & it's Middlewares
dotenv.config()
const app = express()
app.use(express.urlencoded({ extended: true }))    // parse application/x-www-form-urlencoded
app.use(express.json())                            // parse application/json

// ---------------------------------- Key Pair -----------------------------------
const server2PublicKey = fs.readFileSync(path.join(__dirname, './key-pair/public2.pem'), 'utf-8')
const myPrivateKey = fs.readFileSync(path.join(__dirname, './key-pair/private1.pem'), 'utf-8')

// ---------------------------------- Logger Config -----------------------------------
import logger from '../services/logger'
app.use(logger)


// ---------------------------------- Function ----------------------------------
async function restAPI(data: any) {
  const encryptedData = crypto.publicEncrypt(
    { key: server2PublicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
    Buffer.from(JSON.stringify(data))
  )
  const body: string = JSON.stringify({ data: encryptedData.toString('base64') })
  const url: string = `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/action`
  const option: RequestInit = {
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
app.get('/health', celebrate({ query: {} }), (req: Request, res: Response) => { res.send(`${res.statusCode}`) })

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
app.post('/action', validation, async (req: Request, res: Response) => {
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

export default app
