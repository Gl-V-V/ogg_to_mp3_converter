const axios = require('axios');
const fs = require('fs');
const { exec } = require('child_process');
const express = require('express');
const ffmpeg = require('ffmpeg-static');

const app = express();

app.get('/convert', async (req, res) => {
  try {
    const { link } = req.query;
    const oggFile = 'input.ogg';
    const mp3File = 'output.mp3';

    // Download the ogg file
    const response = await axios.get(link, { responseType: 'stream' });
    const writer = fs.createWriteStream(oggFile);
    response.data.pipe(writer);

    writer.on('finish', () => {
      // Convert ogg to mp3 using ffmpeg
      const command = `"${ffmpeg}" -i ${oggFile} ${mp3File}`;
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Conversion error: ${error.message}`);
          return res.status(500).send('Conversion error');
        }
        console.log('Conversion completed successfully');

        // Read the converted mp3 file
        const mp3Data = fs.readFileSync(mp3File);

        // Cleanup temp files
        fs.unlinkSync(oggFile);
        fs.unlinkSync(mp3File);

        // Return the mp3 file as a blob
        res.type('audio/mp3').send(mp3Data);
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/dwnld_ytb_music', async (req, res) => {
  try {
  const { link } = req.query;
  const mp3File = 'output.mp3';
// Download the video from youtube
const response = await ytdl(link, { filter: 'audioonly' });

// Convert the video to mp3 using ffmpeg
const command = `"${ffmpeg}" -i pipe:0 -f mp3 -vn -ab 320k "${mp3File}"`;
const ffmpegProcess = spawn(command, { shell: true });

ffmpegProcess.on('error', (error) => {
  console.error(`Conversion error: ${error.message}`);
  res.status(500).send('Conversion error');
});

ffmpegProcess.on('close', (code) => {
  if (code === 0) {
    console.log('Conversion completed successfully');

    // Read the converted mp3 file
    const mp3Data = fs.readFileSync(mp3File);

    // Cleanup temp file
    fs.unlinkSync(mp3File);

    // Return the mp3 file as a blob
    res.type('audio/mp3').send(mp3Data);
  } else {
    console.error(`Conversion process exited with code ${code}`);
    res.status(500).send('Conversion error');
  }
});

response.pipe(ffmpegProcess.stdin);
} catch (err) {
  console.error(err);
  res.status(500).send('Internal Server Error');
  }
  });




const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});