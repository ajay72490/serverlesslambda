'use strict';

const serverless = require('serverless-http')
const express = require('express')
const app = express()
const AWS = require('aws-sdk')
AWS.config.update({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  region: process.env.region
})
const s3 = new AWS.S3
app.use(express.json());


const multer = require('multer')
const upload = multer({
  limits: {
    fileSize: 2000000,
    files: 1
  },
  fileFilter(req, file, cb){
    if (!file.originalname.match(/\.(jpg|jpeg|png|bmp)$/)) {
      cb(new Error('Please Upload an Image file') )
    }
    cb(null, true)
  }
})


app.post("/uploadtos3",upload.single('upload') ,async (req, res) => {

  const params = {
    Bucket: 'alpha-aj2',
    Key: req.file.originalname,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    ACL: 'public-read'
  }

  s3.putObject(params).promise().then(s3Response => {
    res.json({
      statusCode: 200,
      data: ({ body:  { s3Response }  })
    })
  }).catch(s3Error => {
    res.json({
      statusCode: 400,
      data: ({ body: { s3Error } })
    })
  })
}, (error, req, res, next) => {
  res.json({
    statusCode: 400,
    data: ({ error: error.message })
  })
})

module.exports.hello = serverless(app)