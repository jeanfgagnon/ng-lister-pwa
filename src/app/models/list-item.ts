export class ListItem {
  id: string;
  idHeader: string;
  text: string;
  checked: boolean;

  constructor(id = '', idHeader = '', text = '', checked = false) {
    this.id = id;
    this.idHeader = idHeader;
    this.text = text;
    this.checked = checked;
  }
}