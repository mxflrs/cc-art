import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cloudinary from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class StorageService {
  constructor(private configService: ConfigService) {
    cloudinary.v2.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(
    buffer: Buffer,
    destination: string, // This will be used as public_id (without extension)
    contentType: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        {
          folder: 'card-system', // Optional: organize in a folder
          public_id: destination.replace(/\.[^/.]+$/, ''), // Remove extension for public_id
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result!.secure_url);
        },
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract public_id from URL
      // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/card-system/my_image.jpg
      const splitUrl = fileUrl.split('/');
      const filename = splitUrl[splitUrl.length - 1];
      const publicId = `card-system/${filename.replace(/\.[^/.]+$/, '')}`; // Assuming folder is 'card-system'

      await cloudinary.v2.uploader.destroy(publicId);
    } catch (e) {
      console.error('Error deleting file from Cloudinary:', e);
    }
  }
}
