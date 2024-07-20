import { setup, getLogger, ConsoleHandler } from "@std/log";

setup({
  handlers: {
    console: new ConsoleHandler("DEBUG", {
      formatter: (logRecord) => `${logRecord.levelName} ${logRecord.msg}`,
    }),
  },
  loggers: {
    default: {
      level: "DEBUG",
      handlers: ["console"],
    },
  },
});


interface LogOptions {
  level?: 'debug' | 'info' | 'warn' | 'error';
}

function getCurrentUTCString(): string {
  return new Date().toISOString();
}
const logger = getLogger();

export class Logger {
  static log(message: string, options: LogOptions = {}) {
    const { level = 'info' } = options;
    const utcString = getCurrentUTCString();
    const formattedMessage = `${utcString} [${level.toUpperCase()}] ${message}`;

    switch (level) {
      case 'debug':
        logger.debug(formattedMessage);
        break;
      case 'info':
        logger.info(formattedMessage);
        break;
      case 'warn':
        logger.warn(formattedMessage);
        break;
      case 'error':
        logger.error(formattedMessage);
        break;
      default:
        logger.info(formattedMessage);
    }
  }

  static debug(message: string, options: LogOptions = {}) {
    this.log(message, { ...options, level: 'debug' });
  }

  static info(message: string, options: LogOptions = {}) {
    this.log(message, { ...options, level: 'info' });
  }

  static warn(message: string, options: LogOptions = {}) {
    this.log(message, { ...options, level: 'warn' });
  }

  static error(message: string, options: LogOptions = {}) {
    this.log(message, { ...options, level: 'error' });
  }
}
