const fs = require('fs');
const AWS = require('aws-sdk');

const BUCKET_NAME = 'artplacerassets';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET
});

/*
[
  { Name: 'artplacer-stuff', CreationDate: 2020-03-11T12:16:04.000Z },
  { Name: 'artplacerassets', CreationDate: 2020-03-03T22:16:22.000Z },
  {
    Name: 'artplacerassets-staging',
    CreationDate: 2020-03-11T11:35:44.000Z
  }
]
*/

// AWS_KEY=AKIAZZ5CEU4VTJYFBWVL
// AWS_SECRET=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
// AWS_REGION=us-east-1

module.exports = {
  listBuckets: () => {
    s3.listBuckets(function (err, data) {
      if (err) {
        console.log('Error', err);
      }
      else {
        console.log('Success', data.Buckets);
      }
    });
  },
  uploadFile: (filePath, keyName) => {
    const file = fs.readFileSync(filePath);

    // Setting up S3 upload parameters
    const uploadParams = {
      Bucket: BUCKET_NAME, // Bucket into which you want to upload file
      Key: keyName, // Name by which you want to save it
      Body: file // Local file
    };

    s3.upload(uploadParams, (err, data) => {
      if (err) {
        console.log('Error', err);
      }

      if (data) {
        console.log('Upload Success', data.Location);
      }
    });
  }
}
