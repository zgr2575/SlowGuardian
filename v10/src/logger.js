/**
 * pino logger. Pretty transport ONLY in development; JSON lines in prod/test.
 */
import pino from "pino";
import { config, isDev } from "./config.js";

export const logger = pino(
  isDev
    ? {
        level: "debug",
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:standard", ignore: "pid,hostname" },
        },
      }
    : { level: config.NODE_ENV === "test" ? "warn" : "info" }
);
