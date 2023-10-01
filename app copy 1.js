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
const audioFile = path.join(__dirname, '${filePath}.mp3');
const model = 'whisper-1';
require('dotenv').config();

const app = express();

// Configure multer to store files in a folder named 'uploads'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

//connect to mongodb
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const videoSchema = new mongoose.Schema({
    name: String,
    path: String,
    });

const Video = mongoose.model('Video', videoSchema);

/* Test the database connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.info('Database connected');
});

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});*/

/* test dummy data insertion to mongodb
const video = new Video({
  name: 'test',
  path: 'test',
});

video.save((err, video) => {
  if (err) {
    console.error(err);
  } else {
    console.log(video);
  }
}
);*/

// Sync the model with the database
//Video.sync();

// Route to handle file uploading
app.post('/upload', upload.single('video'), (req, res) => {
  const file = req.file;

  const video = new Video({
    name: file.originalname,
    path: file.path,
  });

  const audioFile = file.path.replace(/\.[^/.]+$/, '.mp3');

  // Convert the video file to an audio file
  exec(`${ffmpegPath} -i ${file.path} -vn -acodec copy ${audioFile}`, (error, stdout, stderr) => {
    if (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    } else {
      video.audioFile = audioFile;

      video.save((err, video) => {
        if (err) {
          console.error(err);
          res.status(500).json({ success: false, error: err.message });
        } else {
          res.redirect(`/videos/${video._id}`);
        }
      });
    }
  });
});

// Route for video transcription
app.get('/transcript/:id', (req, res) => {
  const id = req.params.id;

  // Find the video record in the database by id
  Video.findById(id, (err, video) => {
    if (err) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }

    if (video) {
      const filePath = video.path;
      const audioFile = path.join(__dirname, `${filePath}.mp3`);
      const model = 'whisper-1';

      const formData = new FormData();
      formData.append('model', model);
      formData.append('file', fs.createReadStream(audioFile));

      axios
        .post('https://api.openai.com/v1/audio/transcriptions', formData, {
          headers: {
            Authorization: `Bearer ${process.env.OPENAL_KEY}`,
            'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          },
        })
        .then((transcript) => {
          const transcription = transcript.data;
          res.send(transcription);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ success: false, error: err.message });
        });
    } else {
      res.status(404).json({ success: false, error: 'Record does not exist' });
    }
  });
});

// Route for serving the video files
app.get('/videos/:id', (req, res) => {
  const id = req.params.id;

    // Find the video record in the database by id
  Video.findById(id, (err, video) => {
    if (err) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
      return;
    }
   
    if (!video) {
      res.status(404).json({ success: false, error: 'Record does not exist' });
      return;
    }

    const filePath = video.path;
    const videoFile = path.join(__dirname, filePath);
    const stat = fs.statSync(videoFile);
    const fileSize = stat.size;

    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunkSize = (end - start) + 1;
      const file = fs.createReadStream(videoFile, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoFile).pipe(res);
    }
	});
});

// Start the server
app.listen(process.env.PORT, () => {
  console.log('Server running');
});
