const routes = (config) => {
  const express = require('express')
  const routes = express.Router()
  const users = require('./controllers/usersController')(config)
  const notes = require('./controllers/notesController')(config)
  const wpp = require('./controllers/wppController')(config)
  const format = require('./controllers/formatController')(config)
  
  /**User Routes */
  routes.post('/users/new',users.newUser)
  routes.get('/users/get',users.getUser)
  routes.post('/users/changepassword',users.changePassword)

  /**Auth */
  routes.post('/login',users.login)

  /**Notes */
  routes.use('/notes',users.auth)
  routes.post('/notes/new',notes.myEncrypt,notes.newNote)
  routes.get('/notes/get',notes.getNotes,notes.myDecrypt,(req,res) => res.send(req.body.decryptedData))
  routes.put('/notes/update',notes.myEncrypt,notes.updateNote)
  routes.delete('/notes/delete',notes.deleteNote)

  /**Wpp Integration */
  routes.use('/wpp',users.auth)
  routes.get('/wpp/link',notes.getNotes,notes.myDecrypt,format.formatNote,wpp.getWhatsAppApiLink)

  return routes
}

  
module.exports = routes
