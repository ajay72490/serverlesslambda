module.exports = {
    uploadImage: async (file) => {
        const AWS = require('aws-sdk')
        AWS.config.update({
            accessKeyId: process.env.accessKeyId,
            secretAccessKey: process.env.secretAccessKey,
            region: process.env.region
        })
        const s3 = new AWS.S3
        const { v4: uuidv4 } = require('uuid')
        
        const bucketName = process.env.bucketName
        const s3Url = `https://${bucketName}.s3.${process.env.region}.amazonaws.com/`
        const filename = uuidv4()
        const extension = file.mimetype.split('/').pop()
        const Key = `${filename}.${extension}`
        const params = {
            Bucket: bucketName,
            Key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read'
        }
        const s3Response = await s3.putObject(params).promise()
        if (s3Response.ETag) {
            return {
                statusCode: 200,
                data: ({
                    body: {
                        s3Response,
                        Location: `${s3Url}${Key}`
                    }
                })
            }
        }
        return {
            statusCode: 400,
            data: ({ body: { s3Response } })
        }
    }
}
