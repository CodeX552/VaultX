import { createLogger, format, transports } from 'winston';

// Structured logger se console output predictable aur production-friendly rehta hai.
export const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.errors({ stack: true }), format.json()),
  transports: [
    new transports.Console({
      // Console me readable format chahiye, isliye colorized simple output.
      format: format.combine(format.colorize(), format.simple())
    })
  ]
});
