import { ApplicationRef, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemingService {

  private _isDarkMode = false;

  themes = ["dark-theme", "light-theme"]; // <- list all themes in this array
  theme = new BehaviorSubject("light-theme"); // <- initial theme

  constructor(private ref: ApplicationRef) {
    // Initially check if dark mode is enabled on system
    this.IsDarkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

    // If dark mode is enabled then directly switch to the dark-theme
    if (this.IsDarkMode) {
      this.theme.next("dark-theme");
    }

    const query = window.matchMedia("(prefers-color-scheme: dark)");

    query.addEventListener('change', (e) => {
      this.IsDarkMode = e.matches;
      this.theme.next(this.IsDarkMode ? "dark-theme" : "light-theme");

      // Trigger refresh of UI
      this.ref.tick();
    });
  }

  public get IsDarkMode(): boolean {
    return this._isDarkMode;
  }
  public set IsDarkMode(value: boolean) {
    this._isDarkMode = value;
  }
}