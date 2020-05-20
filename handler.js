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
const { v4: uuidv4 } = require('uuid')
const bucketName = process.env.bucketName
const s3Url = `https://${bucketName}.s3.ap-south-1.amazonaws.com/`
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
  const filename = uuidv4()
  const extension = req.file.mimetype.split('/').pop()
  const Key = `${filename}/${extension}`

  const params = {
    Bucket: bucketName,
    Key,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    ACL: 'public-read'
  }

  s3.putObject(params).promise().then(s3Response => {
    res.json({
      statusCode: 200,
      data: ({ body:  { 
        s3Response,
        Location: `${s3Url}${Key}`
      }})
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