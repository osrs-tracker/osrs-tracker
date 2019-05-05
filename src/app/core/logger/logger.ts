import { environment } from 'environments/environment';

export class Logger {
  static enabled: boolean = !environment.production;

  static log(message?: any, ...optionalParams: any[]): void {
    if (!this.enabled) {
      return;
    }
    console.log(message, ...optionalParams);
  }

  static warn(message?: any, ...optionalParams: any[]): void {
    if (!this.enabled) {
      return;
    }
    console.warn(message, ...optionalParams);
  }

  static error(message?: any, ...optionalParams: any[]): void {
    if (!this.enabled) {
      return;
    }
    console.error(message, ...optionalParams);
  }
}
