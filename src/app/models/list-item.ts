import { IIDText } from './interface-id-text';
import { SubItem } from './sub-item';

export class ListItem implements IIDText  {
  id: string;
  idHeader: string;
  text: string;
  checked: boolean;
  subs: SubItem[];

  constructor(id = '', idHeader = '', text = '', checked = false) {
    this.id = id;
    this.idHeader = idHeader;
    this.text = text;
    this.checked = checked;
    this.subs = [];
  }
}
