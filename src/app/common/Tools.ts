
export class Tools {

  public static capitalize(s: string, hard = false): string {
    if (s && s.length > 0) {
      if (!hard) {
        return s[0].toUpperCase() + s.slice(1);
      }
      else {
        return s[0].toUpperCase() + s.slice(1).toLowerCase();
      }
    }
    return s;
  }

}
