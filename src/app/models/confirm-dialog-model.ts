export class ConfirmDialogModel {
  message: string;
  title: string;

  constructor(m: string, t: string) {
    this.message = m;
    this.title = t;
  }
}
