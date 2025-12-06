import { Controller, Get, Post, Body, Param, Delete, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CardService } from './card.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { CreateStyleDto } from './dto/create-style.dto';
import { CreatePlaceDto } from './dto/create-place.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post('topic')
  createTopic(@Body() dto: CreateTopicDto) {
    return this.cardService.createTopic(dto);
  }

  @Get('topics')
  findAllTopics() {
    return this.cardService.findAllTopics();
  }

  @Delete('topic/:id')
  deleteTopic(@Param('id') id: string) {
    return this.cardService.deleteTopic(+id);
  }

  @Post('style')
  createStyle(@Body() dto: CreateStyleDto) {
    return this.cardService.createStyle(dto);
  }

  @Post('place')
  createPlace(@Body() dto: CreatePlaceDto) {
    return this.cardService.createPlace(dto);
  }

  @Post('item')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  createItem(@Body() dto: CreateItemDto, @UploadedFile() file: any) {
    if (file) {
      dto.imageUrl = file.filename;
    }
    // Parse IDs and dimensions if they come as strings from FormData
    if (typeof dto.placeId === 'string') dto.placeId = parseInt(dto.placeId);
    if (typeof dto.width === 'string') dto.width = parseFloat(dto.width);
    if (typeof dto.height === 'string') dto.height = parseFloat(dto.height);
    
    return this.cardService.createItem(dto);
  }
  
  @Delete('item/:id')
  deleteItem(@Param('id') id: string) {
      return this.cardService.deleteItem(+id);
  }
}
