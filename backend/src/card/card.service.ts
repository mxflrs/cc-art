import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from './entities/topic.entity';
import { Style } from './entities/style.entity';
import { Place } from './entities/place.entity';
import { Item } from './entities/item.entity';
import { CreateTopicDto } from './dto/create-topic.dto';
import { CreateStyleDto } from './dto/create-style.dto';
import { CreatePlaceDto } from './dto/create-place.dto';
import { CreateItemDto } from './dto/create-item.dto';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Topic) private topicRepo: Repository<Topic>,
    @InjectRepository(Style) private styleRepo: Repository<Style>,
    @InjectRepository(Place) private placeRepo: Repository<Place>,
    @InjectRepository(Item) private itemRepo: Repository<Item>,
  ) {}

  // --- Helpers ---

  private toBase26(num: number): string {
    let s = '';
    while (num > 0) {
      num--;
      s = String.fromCharCode(65 + (num % 26)) + s;
      num = Math.floor(num / 26);
    }
    return s || 'A';
  }

  private toRoman(num: number): string {
    const lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
    let roman = '';
    for (const i in lookup ) {
      while ( num >= lookup[i] ) {
        roman += i;
        num -= lookup[i];
      }
    }
    return roman;
  }

  // --- Topic ---

  async createTopic(dto: CreateTopicDto) {
    const count = await this.topicRepo.count();
    const alias = this.toBase26(count + 1);
    const topic = this.topicRepo.create({ ...dto, alias });
    return this.topicRepo.save(topic);
  }

  async findAllTopics() {
    return this.topicRepo.find({ relations: ['styles', 'styles.places', 'styles.places.items'] });
  }

  async deleteTopic(id: number) {
    return this.topicRepo.delete(id);
  }

  // --- Style ---

  async createStyle(dto: CreateStyleDto) {
    const topic = await this.topicRepo.findOne({ where: { id: dto.topicId }, relations: ['styles'] });
    if (!topic) throw new NotFoundException('Topic not found');

    const count = await this.styleRepo.count({ where: { topic: { id: dto.topicId } } });
    const alias = (count + 1).toString();
    
    const style = this.styleRepo.create({ ...dto, alias, topic });
    return this.styleRepo.save(style);
  }

  // --- Place ---

  async createPlace(dto: CreatePlaceDto) {
    const style = await this.styleRepo.findOne({ where: { id: dto.styleId } });
    if (!style) throw new NotFoundException('Style not found');

    const count = await this.placeRepo.count({ where: { style: { id: dto.styleId } } });
    const alias = this.toRoman(count + 1);

    const place = this.placeRepo.create({ ...dto, alias, style });
    return this.placeRepo.save(place);
  }

  // --- Item ---

  async createItem(dto: CreateItemDto) {
    const place = await this.placeRepo.findOne({ where: { id: dto.placeId } });
    if (!place) throw new NotFoundException('Place not found');

    const item = this.itemRepo.create({ ...dto, place });
    return this.itemRepo.save(item);
  }
  
  async deleteItem(id: number) {
      return this.itemRepo.delete(id);
  }
}
