export interface Topic {
  id: number;
  name: string;
  alias: string;
  styles?: Style[];
}

export interface Style {
  id: number;
  name: string;
  alias: string;
  topicId: number;
  places?: Place[];
}

export interface Place {
  id: number;
  name: string;
  alias: string;
  styleId: number;
  items?: Item[];
}

export interface Item {
  id: number;
  name: string;
  width: number;
  height: number;
  imageUrl?: string;
  placeId: number;
}
