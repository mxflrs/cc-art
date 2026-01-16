import { Place } from './place.entity';

export class Style {
  id: number;
  name: string;
  alias: string;
  topicId: number;
  places: Place[];
}
