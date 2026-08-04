import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CloudinaryService } from './cloudinary.service';
import { memoryStorage } from 'multer';

function validateMagicBytes(mimetype: string, magicBytes: Buffer): boolean {
  const hex = magicBytes.toString('hex').toUpperCase();

  if (mimetype === 'image/jpeg' || mimetype === 'image/jpg') {
    return hex.startsWith('FFD8FF');
  }

  if (mimetype === 'image/png') {
    return hex.startsWith('89504E470D0A1A0A');
  }

  if (mimetype === 'image/gif') {
    return hex.startsWith('474946383761') || hex.startsWith('474946383961');
  }

  if (mimetype === 'image/webp') {
    return hex.startsWith('52494646') && hex.slice(16, 24) === '57454250';
  }

  return false;
}

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload an image file to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (jpeg, png, gif, webp)',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (_req, file, callback) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
        ];

        if (!allowedMimes.includes(file.mimetype)) {
          callback(
            new BadRequestException(
              'Only image files (jpeg, png, gif, webp) are allowed',
            ),
            false,
          );
          return;
        }

        callback(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');

    const magicBytes = file.buffer?.slice(0, 12);
    if (!magicBytes) {
      throw new BadRequestException('Unable to validate file content');
    }

    const valid = validateMagicBytes(file.mimetype, magicBytes);
    if (!valid) {
      throw new BadRequestException(
        'File content does not match its declared type',
      );
    }

    return this.cloudinaryService.uploadImage(file);
  }

  @Delete(':publicId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an image from Cloudinary' })
  async deleteFile(@Param('publicId') publicId: string) {
    const decodedPublicId = decodeURIComponent(publicId);
    await this.cloudinaryService.deleteImage(decodedPublicId);
    return { message: 'File deleted successfully' };
  }
}
