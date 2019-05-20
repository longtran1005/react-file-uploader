const express = require('express');
const fileUpload = require('express-fileupload');

const app = express();

app.use(fileUpload());

// Upload Endpoint
app.post('/upload', (req, res) => {
  if (req.files === null) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }
  const file = req.files.file;
  file.mv(`${__dirname}/client/public/uploads/${file.name}`, err => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }
  });


  // convert image to B&W
  const Jimp = require('jimp');
  Jimp.read(`${__dirname}/client/public/uploads/${file.name}`, (err, image) => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }
	image
        //.resize(256, 256) // resize
        .quality(90) // set JPEG quality
        .greyscale()
        .write(`${__dirname}/client/public/uploads/${file.name}`);
    res.json({ fileName: file.name, filePath: `/uploads/${file.name}` });
  });
});

app.listen(5000, () => console.log('Server Started...'));
