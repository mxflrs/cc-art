import { Item } from './item.entity';

export class Place {
  id: number;
  name: string;
  alias: string;
  styleId: number;
  items: Item[];
}
