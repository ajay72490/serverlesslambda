'use strict';

const serverless = require('serverless-http')
const express = require('express')
const app = express()
const multer = require('multer')
const { uploadImage } = require('./uploadTos3')
app.use(express.json());


const upload = multer({
  limits: {
    fileSize: 2000000,
    files: 1
  },
  fileFilter(req, file, cb){
    if (!file.originalname.match(/\.(jpg|jpeg|png|bmp)$/)) {
      cb(new Error('Please Upload an Image file'))
    }
    cb(null, true)
  }
})


app.post("/uploadtos3",upload.single('upload') ,async (req, res) => {
  res.json(await uploadImage(req.file))
}, (error, req, res, next) => {
  res.json({
    statusCode: 400,
    data: ({ error: error.message })
  })
})

module.exports.hello = serverless(app)