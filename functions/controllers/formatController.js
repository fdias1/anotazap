
module.exports = (config) => {
  const { database,env } = config
  
  function getMessageString(document) {
    return `*${document.title}*\n${document.note}`
  }

  return {
    formatNote: async (req,res,next) => {
      try {
        const document = req.body.decryptedData[0]
        req.body.messageString = getMessageString(document)
        next()
      } catch (err) {
        res.status(400).send({message:err})
      }
    }
  }
}