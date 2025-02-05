import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Stream } from 'stream';

cloudinary.config({
  cloud_name: process.env.CLODINARY_CLOUD_NAME,
  api_key: process.env.CLODINARY_API_SECRET,
  api_secret: process.env.CLODINARY_API_SECRET_KEY,
});

@Injectable()
export class UploadService {
  async uploadImage(image: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'shop' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      const bufferStream = new Stream.PassThrough();
      bufferStream.end(image.buffer);
      bufferStream.pipe(uploadStream);
    });
  }
}
