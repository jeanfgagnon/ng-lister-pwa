export class SubItem {
  id: string;
  idItem: string;
  text: string;
  rank: number;
  checked: boolean;

  constructor(id = '', idItem = '', text = '', rank = 0, checked = false) {
    this.id = id;
    this.idItem = idItem;
    this.text = text;
    this.rank = rank;
    this.checked = checked;
  }
}