import { IIDText } from './interface-id-text';
import { ListHeader } from './list-header';

export class ListCategory implements IIDText {
  id: string;
  text: string;
  description: string;
  isDefault: boolean;
  headers: ListHeader[];

  public constructor(id = '', text = '', description = '', isDefault = false, headers = []) {
    this.id = id;
    this.text = text;
    this.description = description;
    this.isDefault = isDefault;
    this.headers = headers;
  }

}