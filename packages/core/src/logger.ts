class Logger {
  private static isDebugEnabled = false;

  static setDebug(enabled: boolean): void {
    this.isDebugEnabled = enabled;
  }

  static isDebug(): boolean {
    return this.isDebugEnabled;
  }

  static log(...args: unknown[]): void {
    if (this.isDebugEnabled) {
      console.log(...args);
    }
  }

  static warn(...args: unknown[]): void {
    if (this.isDebugEnabled) {
      console.warn(...args);
    }
  }

  static error(...args: unknown[]): void {
    if (this.isDebugEnabled) {
      console.error(...args);
    }
  }

  static info(...args: unknown[]): void {
    if (this.isDebugEnabled) {
      console.info(...args);
    }
  }
}

export { Logger };