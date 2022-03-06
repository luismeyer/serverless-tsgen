type LogFunctions = {
  error: (msg: string) => void;
  warning: (msg: string) => void;
  notice: (msg: string) => void;
  debug: (msg: string) => void;
};

export class Logger {
  private static logFunctions: LogFunctions = {
    error: console.error,
    warning: console.warn,
    notice: console.info,
    debug: console.debug,
  };

  public static init(options: LogFunctions) {
    this.logFunctions = options;
  }

  public static log(level: keyof LogFunctions, msg: string) {
    this.logFunctions[level](msg);
  }
}
