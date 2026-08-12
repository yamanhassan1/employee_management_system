const { NODE_ENV } = require("../config/env");

const format = (level, message, meta) => {
  const ts = new Date().toISOString();
  const extra = meta ? ` ${JSON.stringify(meta)}` : "";
  return `[${ts}] ${level.toUpperCase()}: ${message}${extra}`;
};

const logger = {
  info: (message, meta) => console.log(format("info", message, meta)),
  warn: (message, meta) => console.warn(format("warn", message, meta)),
  error: (message, meta) => console.error(format("error", message, meta)),
  debug: (message, meta) => {
    if (NODE_ENV !== "production") console.debug(format("debug", message, meta));
  },
};

module.exports = logger;
