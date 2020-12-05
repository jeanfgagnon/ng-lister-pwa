import { ListItem } from './list-item';

export class ListHeader {
  id: string;
  idCategory: string;
  name: string;
  items: ListItem[];

  constructor(id = '', idCategory = '', name = '') {
    this.id = id;
    this.idCategory = idCategory;
    this.name = name;
    this.items = [];
  }
}