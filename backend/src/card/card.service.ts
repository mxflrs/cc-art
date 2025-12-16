import { Injectable, NotFoundException } from '@nestjs/common';
import { GcpService } from '../gcp/gcp.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { CreateStyleDto } from './dto/create-style.dto';
import { CreatePlaceDto } from './dto/create-place.dto';
import { CreateItemDto } from './dto/create-item.dto';

// Type definitions
export interface Topic {
  id: number;
  name: string;
  alias: string;
  created_at: string;
  styles?: Style[];
}

export interface Style {
  id: number;
  name: string;
  alias: string;
  topic_id: number;
  created_at: string;
  places?: Place[];
}

export interface Place {
  id: number;
  name: string;
  alias: string;
  style_id: number;
  created_at: string;
  items?: Item[];
}

export interface Item {
  id: number;
  name: string;
  alias: string | null;
  width: number | null;
  height: number | null;
  image_url: string | null;
  playground: any;
  place_id: number;
  created_at: string;
}

export interface TopicHistory {
  id: number;
  topic_id: number;
  topic_name: string;
  event: string;
  old_alias: string | null;
  new_alias: string | null;
  details: any;
  created_at: string;
}

@Injectable()
export class CardService {
  constructor(private readonly gcpService: GcpService) {}

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
    const lookup: Record<string, number> = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
    let roman = '';
    for (const i in lookup) {
      while (num >= lookup[i]) {
        roman += i;
        num -= lookup[i];
      }
    }
    return roman;
  }

  // --- Topic ---

  async createTopic(dto: CreateTopicDto) {
    const countResult = await this.gcpService.queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM topics'
    );
    const count = parseInt(countResult?.count || '0', 10);
    const alias = this.toBase26(count + 1);

    const topic = await this.gcpService.queryOne<Topic>(
      'INSERT INTO topics (name, alias) VALUES ($1, $2) RETURNING *',
      [dto.name, alias]
    );

    return topic;
  }

  async findAllTopics() {
    // Get all data
    const topics = await this.gcpService.query<Topic>(
      'SELECT * FROM topics ORDER BY created_at ASC'
    );
    const styles = await this.gcpService.query<Style>(
      'SELECT * FROM styles'
    );
    const places = await this.gcpService.query<Place>(
      'SELECT * FROM places'
    );
    const items = await this.gcpService.query<Item>(
      'SELECT * FROM items'
    );

    // Build nested structure
    const placesWithItems = places.map(place => ({
      ...place,
      items: items.filter(item => item.place_id === place.id),
    }));

    const stylesWithPlaces = styles.map(style => ({
      ...style,
      places: placesWithItems.filter(place => place.style_id === style.id),
    }));

    const topicsWithStyles = topics.map(topic => ({
      ...topic,
      styles: stylesWithPlaces.filter(style => style.topic_id === topic.id),
    }));

    return topicsWithStyles;
  }

  async deleteTopic(id: number) {
    // 1. Fetch topic to be deleted
    const topicToDelete = await this.gcpService.queryOne<Topic>(
      'SELECT * FROM topics WHERE id = $1',
      [id]
    );

    if (!topicToDelete) {
      throw new NotFoundException('Topic not found');
    }

    // 2. Create history record for deletion
    await this.gcpService.execute(
      'INSERT INTO topic_history (topic_id, topic_name, event, old_alias, new_alias, details) VALUES ($1, $2, $3, $4, $5, $6)',
      [topicToDelete.id, topicToDelete.name, 'DELETED', topicToDelete.alias, null, JSON.stringify({ timestamp: new Date().toISOString() })]
    );

    // 3. Delete the topic (cascade will handle children)
    await this.gcpService.execute(
      'DELETE FROM topics WHERE id = $1',
      [id]
    );

    // 4. Fetch remaining topics ordered by creation time
    const remainingTopics = await this.gcpService.query<Topic>(
      'SELECT * FROM topics ORDER BY created_at ASC'
    );

    // 5. Re-index aliases
    for (let i = 0; i < remainingTopics.length; i++) {
      const topic = remainingTopics[i];
      const newAlias = this.toBase26(i + 1);

      if (topic.alias !== newAlias) {
        const oldAlias = topic.alias;

        // Update topic
        await this.gcpService.execute(
          'UPDATE topics SET alias = $1 WHERE id = $2',
          [newAlias, topic.id]
        );

        // Create history record for re-indexing
        await this.gcpService.execute(
          'INSERT INTO topic_history (topic_id, topic_name, event, old_alias, new_alias, details) VALUES ($1, $2, $3, $4, $5, $6)',
          [topic.id, topic.name, 'REINDEXED', oldAlias, newAlias, JSON.stringify({ reason: 'Re-indexing after deletion' })]
        );
      }
    }

    return { message: 'Topic deleted and aliases re-indexed' };
  }

  // --- Style ---

  async createStyle(dto: CreateStyleDto) {
    const topic = await this.gcpService.queryOne<Topic>(
      'SELECT * FROM topics WHERE id = $1',
      [dto.topicId]
    );

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    const countResult = await this.gcpService.queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM styles WHERE topic_id = $1',
      [dto.topicId]
    );
    const count = parseInt(countResult?.count || '0', 10);
    const alias = (count + 1).toString();

    const style = await this.gcpService.queryOne<Style>(
      'INSERT INTO styles (name, alias, topic_id) VALUES ($1, $2, $3) RETURNING *',
      [dto.name, alias, dto.topicId]
    );

    return style;
  }

  // --- Place ---

  async createPlace(dto: CreatePlaceDto) {
    const style = await this.gcpService.queryOne<Style>(
      'SELECT * FROM styles WHERE id = $1',
      [dto.styleId]
    );

    if (!style) {
      throw new NotFoundException('Style not found');
    }

    const countResult = await this.gcpService.queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM places WHERE style_id = $1',
      [dto.styleId]
    );
    const count = parseInt(countResult?.count || '0', 10);
    const alias = this.toRoman(count + 1);

    const place = await this.gcpService.queryOne<Place>(
      'INSERT INTO places (name, alias, style_id) VALUES ($1, $2, $3) RETURNING *',
      [dto.name, alias, dto.styleId]
    );

    return place;
  }

  // --- Item ---

  async createItem(dto: CreateItemDto, fileBuffer?: Buffer, fileName?: string) {
    const place = await this.gcpService.queryOne<Place>(
      'SELECT * FROM places WHERE id = $1',
      [dto.placeId]
    );

    if (!place) {
      throw new NotFoundException('Place not found');
    }

    let imageUrl: string | null = null;

    // Upload file to Cloud Storage if provided
    if (fileBuffer && fileName) {
      const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
      const ext = fileName.split('.').pop();
      const storagePath = `items/${randomName}.${ext}`;

      imageUrl = await this.gcpService.uploadFile(
        fileBuffer,
        storagePath,
        `image/${ext}`
      );
    }

    const item = await this.gcpService.queryOne<Item>(
      'INSERT INTO items (name, alias, width, height, image_url, playground, place_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [
        dto.name,
        dto.alias || null,
        dto.width || null,
        dto.height || null,
        imageUrl || dto.imageUrl || null,
        dto.playground ? JSON.stringify(dto.playground) : null,
        dto.placeId,
      ]
    );

    return item;
  }

  async getItem(id: number) {
    const item = await this.gcpService.queryOne<Item>(
      'SELECT * FROM items WHERE id = $1',
      [id]
    );

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return item;
  }

  async updateItemPlayground(id: number, playground: any) {
    const item = await this.gcpService.queryOne<Item>(
      'UPDATE items SET playground = $1 WHERE id = $2 RETURNING *',
      [JSON.stringify(playground), id]
    );

    return item;
  }

  async deleteItem(id: number) {
    // Get item to find image URL for cleanup
    const item = await this.gcpService.queryOne<{ image_url: string }>(
      'SELECT image_url FROM items WHERE id = $1',
      [id]
    );

    // Delete from storage if exists
    if (item?.image_url) {
      const bucketName = this.gcpService.getBucket()?.name;
      if (bucketName && item.image_url.includes(bucketName)) {
        const path = item.image_url.split(`${bucketName}/`)[1];
        if (path) {
          await this.gcpService.deleteFile(path);
        }
      }
    }

    await this.gcpService.execute(
      'DELETE FROM items WHERE id = $1',
      [id]
    );

    return { message: 'Item deleted' };
  }
}
