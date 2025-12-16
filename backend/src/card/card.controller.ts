import { Controller, Get, Post, Body, Param, Delete, Patch, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CardService } from './card.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { CreateStyleDto } from './dto/create-style.dto';
import { CreatePlaceDto } from './dto/create-place.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { memoryStorage } from 'multer';

// eslint-disable-next-line @typescript-eslint/no-require-imports
type MulterFile = Express.Multer.File;

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
    storage: memoryStorage(), // Use memory storage instead of disk
  }))
  createItem(@Body() dto: CreateItemDto, @UploadedFile() file: MulterFile) {
    // Parse IDs and dimensions if they come as strings from FormData
    if (typeof dto.placeId === 'string') dto.placeId = parseInt(dto.placeId);
    if (typeof dto.width === 'string') dto.width = parseFloat(dto.width);
    if (typeof dto.height === 'string') dto.height = parseFloat(dto.height);
    
    // Pass file buffer and name to service for Cloud Storage upload
    return this.cardService.createItem(dto, file?.buffer, file?.originalname);
  }

  @Get('item/:id')
  getItem(@Param('id') id: string) {
    return this.cardService.getItem(+id);
  }

  @Patch('item/:id/playground')
  updateItemPlayground(@Param('id') id: string, @Body() body: { playground: any }) {
    return this.cardService.updateItemPlayground(+id, body.playground);
  }

  @Delete('item/:id')
  deleteItem(@Param('id') id: string) {
    return this.cardService.deleteItem(+id);
  }
}
