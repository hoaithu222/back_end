import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    try {
      const result = await this.uploadService.uploadImage(file);
      return {
        url: result.secure_url,
        message: 'Upload ảnh thành công',
      };
    } catch (error) {
      return {
        message: 'Upload ảnh thất bại',
        error: error.message,
      };
    }
  }
}
