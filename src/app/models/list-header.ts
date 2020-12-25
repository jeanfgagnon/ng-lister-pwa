import { IIDText } from './interface-id-text';
import { ListItem } from './list-item';

export class ListHeader implements IIDText  {
  id: string;
  idCategory: string;
  text: string;
  items: ListItem[];

  constructor(id = '', idCategory = '', name = '') {
    this.id = id;
    this.idCategory = idCategory;
    this.text = name;
    this.items = [];
  }
}
