'use strict';

const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const fs = require('fs');
const childProcess = require('child_process');
// const AWS = require('aws-sdk');
//const cognitoidentity = require('aws-sdk/clients/cognitoidentity');
const S3 = require('aws-sdk/clients/s3');  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property

const app = express();
const router = express.Router();
const exec = childProcess.exec;

const accessKeyId = 'AKIARS7BSK62RUM2RUGZ';
const secretAccessKey = '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';
const region = 'ap-northeast-1';
const s3 = new S3({
  accessKeyId,
  secretAccessKey,
  region,
});

// const bodyParser = require('body-parser');
// router.use(bodyParser.json())
// router.use(bodyParser.urlencoded({ extended: true }))


/**
 * Option method request handler. For cors.
 */
router.options('*', (req, res) => res.sendStatus(200));

/**
 * Health check.
 */
router.get('/health', (req, res) => res.send('OK!'));

/**
 * Use ytdl(https://github.com/fent/node-ytdl-core)
 * to download a youtube video.
 */
router.get('/ytdl/download', cors(), (req, res) => {
  // console.log('/ytdl/download', req.query);

  const url = req.query.url;
  if (!url) {
    res.send('need youtube video url.');
    return;
  }

  const name = req.query.name || 'video';
  res.header(
    'Content-Disposition',
    `attachment; filename="${name}.mp4"`
  );

  ytdl(url, { format: 'mp4' }).pipe(res);
});

/**
 * Run python script.
 */
router.get('/find', async (req, res) => {
  console.log("\n/find")
  const video = 'video_luna.mp4';
  const image = 'video_luna.mp4_1002000.png';
  const bucket = 'scene-finder';
  const similarity_border = 0.997;

  /*
  // Load a video
  console.log("\n### Load a video");
  const s3videoObject = await s3.getObject({
    Bucket: bucket,
    Key: video,
  })
  .promise()
  .catch((error) => {
    console.log('catch Error:', error);
    return res.send('catch Error');
  });
  console.log(s3videoObject);
  console.log(s3videoObject.Body);
  console.log(s3videoObject.Body.length);

  // capture frame
  console.log("\n### capture frame");
  await new Promise((resolve, reject) => {
    // Write a video
    const videoFilePath = `static/data/${video}`;
    fs.writeFileSync(videoFilePath, s3videoObject.Body);

    // capture video frames
    console.log('=== exec begin ===');
    const COMMAND = `python static/bin/opencv/capture_frame.py ${video}`;
    exec(COMMAND, (error, stdout, stderr) => {
      console.log('=== exec done ===');
      console.log('stdout', stdout);
      if (error) {
        const msg = `Exec error: ${error}`;
        throw Error(msg);
      }
      if (stderr) {
        const msg = `Exec stderr: ${stderr}`;
        throw Error(msg);
      }
      resolve();
    });
  })
  .catch((error) => {
    console.log('catch Error:', error);
    return res.send('catch Error');
  });

  // Load an image
  console.log("\n### Load an image");
  const s3imageObject = await s3.getObject({
    Bucket: bucket,
    Key: image,
  })
  .promise()
  .catch((error) => {
    console.log('catch Error:', error);
    return res.send('catch Error');
  });
  console.log(s3imageObject);
  console.log(s3imageObject.Body);
  console.log(s3imageObject.Body.length);
  */

  // find similar scenes
  console.log("\n### find similar scenes");
  await new Promise((resolve, reject) => {
    // Write an image
    // const imageFilePath = `static/data/${image}`;
    // fs.writeFileSync(imageFilePath, s3imageObject.Body);

    // capture video frames
    console.log('=== exec begin ===');
    const COMMAND = `python static/bin/opencv/find_similar_scenes.py ${image} ${similarity_border}`;
    exec(COMMAND, (error, stdout, stderr) => {
      console.log('=== exec done ===');
      console.log('stdout', stdout);
      if (error) {
        const msg = `Exec error: ${error}`;
        throw Error(msg);
      }
      if (stderr) {
        const msg = `Exec stderr: ${stderr}`;
        throw Error(msg);
      }
      resolve();
    });
  })
  .catch((error) => {
    console.log('catch Error:', error);
    return res.send('catch Error');
  });

  //
  res.send('done');
});

app.use('/', router);

// Let aws-serverless-express create a server
const server = app.listen(3000, () => {
  console.log('Expressjs port:', server.address().port), "\n";
});

// Export your express server so you can import it in the lambda function.
module.exports = app
