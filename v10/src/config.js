/**
 * Fail-fast environment config (envalid). No globals — import { config }.
 * cleanEnv() validates process.env at boot and hard-exits on a bad value,
 * so the rest of the app can trust these fields.
 */
import { cleanEnv, str, port, host } from "envalid";

export const config = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "production", "test"],
    default: "development",
  }),
  PORT: port({ default: 8080 }),
  HOST: host({ default: "0.0.0.0" }),
});

export const isDev = config.NODE_ENV === "development";
