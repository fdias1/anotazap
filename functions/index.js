require('dotenv').config()
const functions = require('firebase-functions')
const admin = require("firebase-admin")
const serviceAccount = require("./serviceKey.json")
const routes = require('./routes')
const express = require('express')
const cors = require('cors')

const app = express()
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://anotazap.firebaseio.com"
})
const db = admin.firestore()

const config  = {
  database:db,
  env:process.env.ENV
}

app.use(cors({origin:true}))
app.use(express.json())
app.use(routes(config))

exports.api = functions.https.onRequest(app)
