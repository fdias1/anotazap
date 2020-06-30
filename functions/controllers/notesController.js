module.exports = (config) => {
  const bcrypt = require('bcrypt')
  const crypto = require('crypto')
  const jwt = require('jsonwebtoken')
  const { database,env } = config
  const collection = `${env}_notes`
  const secret = process.env.SECRET
  const algorithm = 'aes-256-cbc'
  const key = process.env.KEY
  const iv = process.env.IV
  
  return { 
    myEncrypt: async (req,res,next) => {
      for (let decryptedData of Object.keys(req.body)) {
        const text = req.body[decryptedData]
        let cipher = await crypto.createCipheriv('aes-256-cbc', await Buffer.from(key), iv)
        let encrypted = await cipher.update(text)
        encrypted = await Buffer.concat([encrypted, await cipher.final()])
        req.body[decryptedData] = encrypted.toString('hex')
      }
      next()
    },
    
    myDecrypt: async (req,res,next) => {
      req.body.decryptedData = []
      for (let encryptedObject of req.body.encryptedData) {
        const decryptedObject = {}
        for (let encryptedString of ['note','title']){

          const text = encryptedObject[encryptedString]
          let encryptedText = await Buffer.from(text, 'hex')
          let decipher = await crypto.createDecipheriv('aes-256-cbc', await Buffer.from(key), iv)
          let decrypted = await decipher.update(encryptedText)
          decrypted = await Buffer.concat([decrypted, await decipher.final()])
          decryptedObject[encryptedString] = decrypted.toString()
        }
        decryptedObject.userId = encryptedObject.userId
        decryptedObject.id = encryptedObject.id
        req.body.decryptedData.push(decryptedObject)
      }
      next()
    },

    newNote: async (req,res) => {
      try{
        req.body.userId = req.headers.userData.id
        req.body.id = crypto.randomBytes(32).toString('hex')
        const result = await database.collection(collection).doc(req.body.id).create(req.body)
        res.send({message:'new note successfully created'})
      } catch(err) {
        res.status(400).send({ message:err })
      }
    },

    getNotes: async(req,res,next) => {
      try {
        let query = database.collection(collection).where('userId','==', req.headers.userData.id)
        if (req.query.id) {
          query = query.where('id','==', req.query.id)
        }
        let response = []
        let snapshot = await query.get()
        let docs = await snapshot.docs
        for (let doc of docs) {
          const selectedItem = await doc.data()
          response.push(selectedItem)
        }
        req.body.encryptedData = response
        next()
      } catch(err) {
        res.status(400).send({ message:'unexpected error'})
      }
    },

    updateNote: async (req,res) => {
      try {
      } catch(err) {
        res.status(400).send(err)
      }
        const data = await (await database.collection(collection).doc(req.query.id).get()).data()
        if (data.userId == req.headers.userData.id) {
          const note = req.body.note || data.note
          const title = req.body.title || data.title
          const newData = { note, title }
          const query = await database.collection(collection).doc(req.query.id).update(newData)
          res.status(200).send(await (await database.collection(collection).doc(req.query.id).get()).data())
        } else {
          throw 'unauthorized'
        }
    },

    deleteNote: async (req,res) => {
      try {
        const data = await (await database.collection(collection).doc(req.query.id).get()).data()
        if (data.userId == req.headers.userData.id) {
          const query = await database.collection(collection).doc(req.query.id).delete()
          res.status(200).send(query)
        } else {
          throw {message: 'unauthorized'}
        }
      } catch(err) {
        res.status(400).send(err)
      }
    }
  }
}
