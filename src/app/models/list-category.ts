import { ListHeader } from './list-header';

export class ListCategory {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  headers: ListHeader[];

  public constructor(id = '', name = '', description = '', isDefault = false, headers = []) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.isDefault = isDefault;
    this.headers = headers;
  }

}