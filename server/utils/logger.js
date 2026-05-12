// Pino logger. Pretty-prints in dev, JSON in prod (logging platforms parse it).
const pino = require('pino');
const { env } = require('../config/env');

const logger = pino(
  env.NODE_ENV === 'development'
    ? {
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
        },
      }
    : {
        level: env.NODE_ENV === 'test' ? 'silent' : 'info',
      },
);

module.exports = logger;
