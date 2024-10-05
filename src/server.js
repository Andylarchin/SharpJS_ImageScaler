const express = require('express');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const imagesFolder = path.join(__dirname, 'images');

app.get('/:dimensions/:filename', async (req, res) => {
  const { dimensions, filename } = req.params;
  
  const [width, height, quality] = dimensions.split('x').map(Number);

  if (!width || !height || !quality) {
    return res.status(400).send('Invalid dimensions format. Use WxHxQ.');
  }

  const folderPath = path.join(imagesFolder, `${width}x${height}x${quality}`);
  const filePath = path.join(folderPath, filename);

  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }

  const originalImagePath = path.join(imagesFolder, 'original', filename);
  if (!fs.existsSync(originalImagePath)) {
    return res.status(404).send('Original image not found');
  }

  try {
    const resizedImage = await sharp(originalImagePath)
      .resize(width, height)
      .jpeg({ quality })
      .toBuffer();

    fs.mkdirSync(folderPath, { recursive: true });
    fs.writeFileSync(filePath, resizedImage);

    res.set('Content-Type', 'image/jpeg');
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).send('Error processing the image');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});