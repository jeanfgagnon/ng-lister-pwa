import { ListItem } from './list-item';

export class ListHeader {
  id: string;
  name: string;
  items: ListItem[];

  constructor(id = '', name = '') {
    this.id = id;
    this.name = name;
    this.items = [];
  }
}