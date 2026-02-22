export class Logger {
  info(message: string, ...args: unknown[]): void {
    console.log(`[info] ${message}`, ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    console.log(`[debug] ${message}`, ...args);
  }
}
