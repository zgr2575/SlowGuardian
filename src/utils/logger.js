/**
 * Logger utility for SlowGuardian
 * Provides structured logging with different levels
 */

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

export class Logger {
  constructor(context = "App", level = "info") {
    this.context = context;
    this.level = LOG_LEVELS[level] ?? LOG_LEVELS.info;
  }

  setLevel(level) {
    this.level = LOG_LEVELS[level] ?? LOG_LEVELS.info;
  }

  error(...args) {
    if (this.level >= LOG_LEVELS.error) {
      console.error(`[${new Date().toISOString()}] [ERROR] [${this.context}]`, ...args);
    }
  }

  warn(...args) {
    if (this.level >= LOG_LEVELS.warn) {
      console.warn(`[${new Date().toISOString()}] [WARN] [${this.context}]`, ...args);
    }
  }

  info(...args) {
    if (this.level >= LOG_LEVELS.info) {
      console.info(`[${new Date().toISOString()}] [INFO] [${this.context}]`, ...args);
    }
  }

  debug(...args) {
    if (this.level >= LOG_LEVELS.debug) {
      console.debug(`[${new Date().toISOString()}] [DEBUG] [${this.context}]`, ...args);
    }
  }
}