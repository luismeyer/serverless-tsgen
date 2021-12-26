export type LogFunctions = {
  error: (msg: string) => void;
  warning: (msg: string) => void;
  notice: (msg: string) => void;
  debug: (msg: string) => void;
};

let logFunctions: LogFunctions = {
  error: console.error,
  warning: console.warn,
  notice: console.info,
  debug: console.debug,
};

export const initLogger = (options: LogFunctions) => {
  logFunctions = options;
};

export const log = (level: keyof typeof logFunctions, msg: string) => {
  logFunctions[level](msg);
};
