module.exports = (config) => {
  const bcrypt = require('bcrypt')
  const crypto = require('crypto')
  const { database,env } = config
  const collection = `${env}_users`
  const secret = process.env.SECRET
  const jwt = require('jsonwebtoken')
  
  return {
    getWhatsAppApiLink: async (req,res) => {
      try {
        if(!req.query.id || !req.query.phone || req.body.decryptedData.length == 0) {
          throw 'Invalid request'
        } else {
          res.status(200).send(`${process.env.WPP_API_ADDRESS}phone=${req.query.phone}&text=${encodeURI(req.body.messageString)}` )
        }
      } catch (err) {
        res.status(400).send({message:err})
      }
    }
  }
}

