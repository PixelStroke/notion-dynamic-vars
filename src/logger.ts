import { brightGreen, brightRed, brightYellow, brightBlue } from "fmt/colors";

interface LogOptions {
  color?: string;
  level?: 'debug' | 'info' | 'warn' | 'error';
  style?: string | string[];
}

const logLevels = {
  debug: brightBlue,
  info: brightGreen,
  warn: brightYellow,
  error: brightRed,
};

const logStyles: { [key: string]: string } = {
  bold: "font-weight: bold",
  italic: "font-style: italic",
};

function getCurrentUTCString(): string {
  return new Date().toISOString();
}

function getCallerFunctionName(): string {
  const error = new Error();
  const stack = error.stack?.split("\n");
  if (stack && stack.length > 3) {
    const callerLine = stack[3].trim();
    const functionName = callerLine.split(" ")[1];
    return functionName;
  }
  return "Unknown";
}

export class Logger {
  static log(message: string, value?: unknown, options: LogOptions = {}) {
    const { color, level = 'info', style } = options;
    const levelColor = color || logLevels[level];
    const styleStr = Array.isArray(style) ? style.map(s => logStyles[s]).join(';') : (style ? logStyles[style] : '');

    const utcString = getCurrentUTCString();
    const functionName = getCallerFunctionName();
    const formattedMessage = `${utcString} [${level.charAt(0).toUpperCase() + level.slice(1)}] [${functionName}]: ${message}`;

    const css = `color: ${levelColor}; ${styleStr}`;
    console.log(`%c${formattedMessage}`, css, value);
  }

  static debug(message: string, value?: unknown, options: LogOptions = {}) {
    this.log(message, value, { ...options, level: 'debug' });
  }

  static info(message: string, value?: unknown, options: LogOptions = {}) {
    this.log(message, value, { ...options, level: 'info' });
  }

  static warn(message: string, value?: unknown, options: LogOptions = {}) {
    this.log(message, value, { ...options, level: 'warn' });
  }

  static error(message: string, value?: unknown, options: LogOptions = {}) {
    this.log(message, value, { ...options, level: 'error' });
  }
}
