import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';

@Injectable()
export class ImageService {
  private readonly imagesFolder = path.join(__dirname, '..', '..', 'images');

  async resizeImage(filename: string, width: number, height: number, quality: number): Promise<Buffer> {
    const folderPath = path.join(this.imagesFolder, `${width}x${height}x${quality}`);
    const filePath = path.join(folderPath, filename);

    if (fs.existsSync(filePath)) {
      return fs.promises.readFile(filePath);
    }

    const originalImagePath = path.join(this.imagesFolder, 'original', filename);

    if (!fs.existsSync(originalImagePath)) {
      throw new NotFoundException('Original image not found');
    }

    const resizedImage = await sharp(originalImagePath)
      .resize(width, height)
      .jpeg({ quality })
      .toBuffer();

    await fs.promises.mkdir(folderPath, { recursive: true });
    await fs.promises.writeFile(filePath, resizedImage);

    return resizedImage;
  }
}