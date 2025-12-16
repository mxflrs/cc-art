export class CreateItemDto {
  name: string;
  width?: number;
  height?: number;
  placeId: number;
  imageUrl?: string;
  alias?: string;
  playground?: any;
}
