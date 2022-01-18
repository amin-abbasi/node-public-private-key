// Import npm modules
import express, { Request, Response } from 'express'
import { celebrate, Joi, errors } from 'celebrate'
import crypto from 'crypto'
import fs     from 'fs'
import path   from 'path'
import dotenv  from 'dotenv'

// Initialize App & it's Middlewares
dotenv.config()
const app = express()
app.use(express.urlencoded({ extended: true }))    // parse application/x-www-form-urlencoded
app.use(express.json())                            // parse application/json

// ---------------------------------- Key Pair -----------------------------------
const server1PublicKey = fs.readFileSync(path.join(__dirname, './key-pair/public1.pem'), 'utf-8')
const myPrivateKey = fs.readFileSync(path.join(__dirname, './key-pair/private2.pem'), 'utf-8')

// ---------------------------------- Logger Config -----------------------------------
import logger from '../services/logger'
app.use(logger)


// -------------------------------------- Routes -------------------------------------
// Health-check Endpoint
app.get('/health', celebrate({ query: {} }), (req: Request, res: Response) => { res.send(`${res.statusCode}`) })

// Get an encrypted message and process it
const validation = celebrate({
  body: {
    data: Joi.string().required().description('Encrypted Data'),
  },
  query: {}
})
app.post('/action', validation, async (req: Request, res: Response) => {
  try {
    const encryptedData = req.body.data

    // In order to decrypt the data, we need to specify the
    // same hashing function and padding scheme that we used to
    // encrypt the data in the previous step
    const keyData = {
      key: myPrivateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    }
    const decryptedData = crypto.privateDecrypt(keyData, Buffer.from(encryptedData, 'base64'))
    const dataObject = JSON.parse(decryptedData.toString('utf-8'))

    let result = 0
    switch (dataObject.action) {
      case 'add':
        result = dataObject.var1 + dataObject.var2
        break;
      case 'multiply':
        result = dataObject.var1 * dataObject.var2
        break;
      case 'divide':
        result = dataObject.var1 / dataObject.var2
        break;
      case 'reduce':
        result = dataObject.var1 - dataObject.var2
        break;
      default:
        break;
    }

    res.send({ success: true, result })
  } catch (error) {
    console.log('Error: ', error)
    res.send({ success: false, error })
  }
})

// Use Celebrate to validate routes
app.use(errors())

export default app
