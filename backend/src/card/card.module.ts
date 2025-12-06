import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { Topic } from './entities/topic.entity';
import { Style } from './entities/style.entity';
import { Place } from './entities/place.entity';
import { Item } from './entities/item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Topic, Style, Place, Item])],
  controllers: [CardController],
  providers: [CardService]
})
export class CardModule {}
