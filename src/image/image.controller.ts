import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ImageService } from './image.service';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get('/:filename')
  async resizeImage(
    @Param('filename') filename: string,
    @Query('width') width: string,
    @Query('height') height: string,
    @Query('quality') quality: string,
    @Res() res: Response,
  ) {
    const resizedImage = await this.imageService.resizeImage(
      filename,
      parseInt(width, 10),
      parseInt(height, 10),
      parseInt(quality, 10),
    );
    
    res.set('Content-Type', 'image/jpeg');
    res.send(resizedImage);
  }
}