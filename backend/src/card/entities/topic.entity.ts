import { Style } from './style.entity';

export class Topic {
  id: number;
  name: string;
  alias: string;
  styles: Style[];
}
