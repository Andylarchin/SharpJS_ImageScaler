const express = require('express');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const imagesFolder = path.join(__dirname, 'images');

app.get('/:dimensions/:filename', async (req, res) => {
  const { width, height, quality, image } = req.params;

  const parsedWidth = parseInt(width);
  const parsedHeight = parseInt(height);
  const parsedQuality = parseInt(quality);

  // Validate width, height, and quality
  if (parsedWidth <= 0 || parsedHeight <= 0) {
    return res.status(400).send("Invalid dimensions: width and height must be greater than 0.");
  }

  if (parsedQuality <= 0 || parsedQuality > 100) {
    return res.status(400).send("Invalid quality: quality must be between 1 and 100.");
  }

  // Define original image path
  const originalImagePath = path.join(__dirname, 'src', 'images', 'original', image);

  // Check if original image exists
  if (!fs.existsSync(originalImagePath)) {
    return res.status(404).send('Original image not found.');
  }

  // Extract image format from the original image
  const imageMetadata = await sharp(originalImagePath).metadata();
  const imageFormat = imageMetadata.format;  // e.g., 'jpeg', 'png'

  // Define the output folder based on the requested dimensions and quality
  const outputFolder = path.join(__dirname, 'src', 'images', `${width}x${height}x${quality}`);
  const outputImagePath = path.join(outputFolder, image);

  // Check if the resized image already exists
  if (fs.existsSync(outputImagePath)) {
    return res.sendFile(outputImagePath);  // Send the cached resized image
  }

  // Create the folder if it doesn't exist
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }

  // Resize and save the image while retaining the format
  sharp(originalImagePath)
    .resize(parsedWidth, parsedHeight)
    .toFormat(imageFormat, { quality: parsedQuality })  // Keep the original format
    .toFile(outputImagePath, (err, info) => {
      if (err) {
        console.error('Error resizing image:', err);
        return res.status(500).send('Error resizing image.');
      }

      // Send the resized image
      return res.sendFile(outputImagePath);
    });
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});