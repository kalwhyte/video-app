# Video Upload and Streaming Project Documentation

## Table of Contents

- [Video Upload and Streaming Project Documentation](#video-upload-and-streaming-project-documentation)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Project Overview](#project-overview)
  - [Requirements](#requirements)
  - [Installation](#installation)
    - [Install project dependencies:](#install-project-dependencies)
  - [API Endpoints](#api-endpoints)
    - [Dependencies](#dependencies)

## Introduction

This documentation provides an overview of a video upload and streaming project built using Node.js, Express.js, MongoDB, and OpenAI for transcription. The project allows users to upload videos, transcribe them, and stream the videos in chunks.

## Project Overview

- **Video Upload**: Users can upload video files to the server. Uploaded videos are stored in the `uploads/` directory, and their metadata is saved in a MongoDB database.

- **Video Transcription**: The project integrates with the OpenAI API to transcribe audio from uploaded videos. Transcription results are stored in the database.

- **Video Streaming**: Users can stream videos from the server. The server supports video streaming in chunks to optimize playback.

## Requirements

Before getting started, ensure you have the following software and services installed:

- Node.js and npm (Node Package Manager)
- MongoDB
- OpenAI API Key
- FFMPEG (required for audio extraction)

## Installation

1. Clone the project repository from GitHub:

   ```bash
   git clone https://github.com/kalwhyte/video-app.git
   cd your-project

### Install project dependencies:

`npm install`

**Configuration**
Create a .env file in the project root directory and configure the following environment variables:

``DB_URL=your_mongodb_connection_string
OPENAI_KEY=your_openai_api_key
PORT=your_preferred_server_port``

Make sure you have `FFMPEG` installed on your system for audio extraction.

**Uploading Videos**
To upload a video, send a POST request to the /upload endpoint with the video file attached as a multipart/form-data request.

**Using curl:**

curl -X POST -F "video=@/path/to/your/video.mp4" http://localhost:your_port/upload

**Transcribing Videos**
To transcribe a video, send a `GET` request to the /transcript/:id endpoint, where :id is the video's unique identifier.

**Using curl:**

`curl http://localhost:your_port/transcript/your_video_id`

**Streaming Videos**
To stream a video, send a `GET` request to the /videos/:id endpoint, where :id is the video's unique identifier. The server will handle video streaming in chunks.

Example using a web browser or video player:

<video src="http://localhost:your_port/videos/your_video_id" controls></video>

## API Endpoints

/`upload` (`POST`): Upload a video file.
/`transcript`/:`id` (`GET`): Retrieve the transcription of a video by `ID`.
/videos/:id (`GET`): Stream a video by `ID`.

### Dependencies

Express.js
Multer
Mongoose
Axios
Form-Data
ffmpeg-static (for audio extraction)

**License**
This project is licensed under the MIT License. See the LICENSE file for details.
