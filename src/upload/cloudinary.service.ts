import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { configureCloudinary } from './cloudinary.config';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    configureCloudinary(this.configService);
  }

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ url: string; publicId: string; fileName: string }> {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'resturant-uploads',
          public_id: `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
          transformation: [
            { width: 1200, height: 1200, crop: 'limit', quality: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary error:', error.message);
            reject(error);
          } else if (!result) {
            reject(new Error('Upload failed'));
          } else resolve(result);
        },
      );
      uploadStream.end(file.buffer);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      fileName: result.public_id.split('/').pop() || result.public_id,
    };
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
