export class Logger {
  static log(message?: any, ...optionalParams: any[]): void {
    console.log(message, ...optionalParams);
  }

  static warn(message?: any, ...optionalParams: any[]): void {
    console.warn(message, ...optionalParams);
  }

  static error(message?: any, ...optionalParams: any[]): void {
    console.error(message, ...optionalParams);
  }
}
