// test/test.js
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const FormData = require('form-data');
const { execSync: exec } = require('child_process');
const ffmpegStatic = require('ffmpeg-static');
const ffmpegPath = require('ffmpeg-static');
const e = require('express');
const audioFile = path.join(__dirname, '${filePath}.mp3');
const model = 'whisper-1';
require('dotenv').config();
const app = express();

chai.use(chaiHttp);
const expect = chai.expect;

if (process.env.NODE_ENV === 'test') {
  const chai = require('chai');
  const chaiHttp = require('chai-http');
  const mongoose = require('mongoose');
  const app = require('../app copy 1'); // Import your Express app
  require('dotenv').config();

  chai.use(chaiHttp);
  const expect = chai.expect;
  describe('Video API Tests', () => {
    before((done) => {
      // Connect to the MongoDB database for testing (you may want to use a different test database)
      mongoose.connect('process.env.DB_URL', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      mongoose.connection.once('open', () => {
        done();
      });
    });

    it('should return a 200 response when uploading a video', (done) => {
      chai
        .request(app)
        .post('/upload')
        .attach('video', 'path/to/your/test/video.mp4') // Replace with a test video file
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    after((done) => {
      // Disconnect from the MongoDB database after testing
      mongoose.connection.close(() => {
        done();
      });
    });
  });
} else {
  mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', () => {
    console.info('Database connected');
  });
  app.listen(3000, () => {
    console.log('Listening on port 3000');
  });
}

