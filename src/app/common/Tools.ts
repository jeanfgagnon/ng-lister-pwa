
export class Tools {

  public static capitalize(s: string): string {
    if (s && s.length > 0) {
      return s[0].toUpperCase() + s.slice(1).toLowerCase();
    }
    return s;
  }

}