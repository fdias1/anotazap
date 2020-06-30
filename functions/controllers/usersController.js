module.exports = (config) => {
  const bcrypt = require('bcrypt')
  const crypto = require('crypto')
  const { database,env } = config
  const collection = `${env}_users`
  const secret = process.env.SECRET
  const jwt = require('jsonwebtoken')
  
  return {

    newUser:async (req,res) => {
      try {
        if (req.body.username && req.body.password){
          userData = {
            username:req.body.username,
            password:await bcrypt.hash(req.body.password,10),
            id:crypto.randomBytes(32).toString('hex'),
          }
          const result = await database.collection(collection).doc(userData.username).create(userData)
          res.status(200).send(result)
        } else {
          throw {erro:'É necessário informar um login e senha para se cadastrar.'}
        }
      } catch(err) {
        res.status(400).send(err)
      }
    },

    getUser:async (req,res) => {
      try {
        let query = database.collection(collection)
        if (req.query.username) {
          query = query.where('username','==', req.query.username)
        } else if (req.query.id) {
          query = query.where('id','==', req.query.id)
        }
        let response = []
        let snapshot = await query.get()
        let docs = await snapshot.docs
        for (let doc of docs) {
          const selectedItem = await doc.data()
          response.push(selectedItem)
        }
        res.status(200).send(response.length == 1 ? response[0] : response)
      } catch(err){
        res.status(400).send(err)
      }
    },

    changePassword:async (req,res) => {
      try {
        if (req.body.password && req.body.username){
          userData = {
            password:await bcrypt.hash(req.body.password,10)
          }
          const exists = await (await database.collection(collection).doc(req.body.username).get()).exists
          if (exists) await database.collection(collection).doc(req.body.username).update(userData)
          res.send({mensagem:'senha alterada'})
        }
      } catch (err) {
        res.status(400).send(err)
      }
    },

    /** Get token when username and password match */
    login:async(req,res) => {
      const userData = await (await database.collection(collection).doc(req.body.username).get()).data()
      const auth = await bcrypt.compare(req.body.password,userData.password)
      if (auth) {
        delete userData.password
        const token = jwt.sign(userData, process.env.SECRET,{expiresIn:'1d'})
        res.status(200).send({ token })
      } else {
        res.status(400).send({message:'unauthorized'})
      }
    },

    /** Authorization middleware */
    auth:async (req,res,next) => {
      try {
        const userData = jwt.verify(req.headers.token,process.env.SECRET)
        req.headers.userData = userData
        next()
      } catch (err) {
        res.status(400).send({message:'unauthorized'})
      }
    }
  }
}
