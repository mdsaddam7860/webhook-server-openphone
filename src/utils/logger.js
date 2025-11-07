// // logger.js
// import { createLogger, format, transports } from "winston";
// import "winston-daily-rotate-file"; // Import daily rotate transport
// const { combine, timestamp, printf, colorize, errors, json } = format;
// // import DailyRotateFile from "winston-daily-rotate-file";

// // Custom log format
// const logFormat = printf(({ level, message, timestamp }) => {
//   return `[${level}]: ${timestamp}  ${message}`;
// });

// // Custom development log format with colors
// const devFormat = printf(({ level, message, timestamp, stack }) => {
//   const logMessage = stack || message; // Show stack trace for errors
//   return `[${level}] : ${timestamp} :   ${logMessage}`;
// });

// const developmentLogger = () => {
//   return createLogger({
//     level: "info",
//     format: combine(
//       colorize({ all: true }),
//       timestamp(),
//       // timestamp({ format: "HH:mm:ss" }),
//       errors({ stack: true }),
//       devFormat
//     ),
//     transports: [
//       // Log everything to console
//       new transports.Console({
//         level: "error",
//         handleExceptions: true,
//         handleRejections: true,
//       }),

//       // Single file for all logs (appends)
//       new transports.File({
//         filename: "logs/development.log",
//         level: "info",
//         handleExceptions: true,
//         handleRejections: true,
//         maxsize: 5 * 1024 * 1024, // optional: 5MB cap
//       }),
//     ],
//   });
// };
// const productionLogger = () => {
//   const monthlyErrorTransport = new transports.DailyRotateFile({
//     filename: "logs/error-%DATE%.log",
//     datePattern: "YYYY-MM", // monthly rotation
//     level: "error",
//     maxSize: "10m",
//     maxFiles: "6M", // keep logs for 6 months
//     zippedArchive: true,
//   });

//   const monthlyCombinedTransport = new transports.DailyRotateFile({
//     filename: "logs/combined-%DATE%.log",
//     datePattern: "YYYY-MM",
//     maxSize: "10m",
//     maxFiles: "3M", // keep logs for 3 months
//     zippedArchive: true,
//   });

//   return createLogger({
//     level: process.env.LOG_LEVEL || "info",
//     format: combine(timestamp(), errors({ stack: true }), json()),
//     defaultMeta: { service: "aspire-integration" },
//     transports: [
//       monthlyErrorTransport,
//       monthlyCombinedTransport,
//       // Log everything to console
//       new transports.Console({
//         level: "error",
//         handleExceptions: true,
//         handleRejections: true,
//       }),
//     ],
//     exceptionHandlers: [
//       new transports.DailyRotateFile({
//         filename: "logs/exceptions-%DATE%.log",
//         datePattern: "YYYY-MM",
//         maxSize: "10m",
//         maxFiles: "6M",
//         zippedArchive: true,
//       }),
//     ],
//     rejectionHandlers: [
//       new transports.DailyRotateFile({
//         filename: "logs/rejections-%DATE%.log",
//         datePattern: "YYYY-MM",
//         maxSize: "10m",
//         maxFiles: "6M",
//         zippedArchive: true,
//       }),
//     ],
//   });
// };

// let logger = null;

// if (process.env.NODE_ENV === "development") {
//   logger = developmentLogger();
// }
// if (process.env.NODE_ENV === "production") {
//   logger = productionLogger();
// }

// // Add event listeners for daily rotate transports (optional but helpful)
// const setupTransportEvents = (loggerInstance, environment) => {
//   loggerInstance.transports.forEach((transport) => {
//     if (transport instanceof transports.DailyRotateFile) {
//       transport.on("new", (filename) => {
//         console.log(`[${environment}] New log file created: ${filename}`);
//       });

//       transport.on("rotate", (oldFilename, newFilename) => {
//         console.log(
//           `[${environment}] Log file rotated from ${oldFilename} to ${newFilename}`
//         );
//       });

//       transport.on("logRemoved", (removedFilename) => {
//         console.log(
//           `[${environment}] Old log file removed: ${removedFilename}`
//         );
//       });
//     }
//   });
// };

// if (!logger) {
//   logger = developmentLogger();
// }

// // Initialize event listeners
// if (logger) {
//   setupTransportEvents(logger, process.env.NODE_ENV || "development");
// }

// export default logger;

import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";

const { combine, timestamp, printf, errors, colorize, json } = format;

// Console log format (colored)
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `[${level}] ${timestamp} - ${stack || message}`;
});

// File log format (clean, no colors)
const fileFormat = printf(({ level, message, timestamp, stack }) => {
  return `[${level}] ${timestamp} - ${stack || message}`;
});

const developmentLogger = () => {
  return createLogger({
    level: "info",
    format: combine(timestamp(), errors({ stack: true })),
    transports: [
      new transports.Console({
        format: combine(colorize(), timestamp(), consoleFormat),
        handleExceptions: true,
        handleRejections: true,
      }),
      new transports.File({
        filename: "logs/development.log",
        format: fileFormat,
        level: "info",
        maxsize: 5 * 1024 * 1024, // 5MB
        handleExceptions: true,
        handleRejections: true,
      }),
    ],
  });
};

const productionLogger = () => {
  const dailyError = new transports.DailyRotateFile({
    filename: "logs/error-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    level: "error",
    zippedArchive: true,
    maxSize: "10m",
    maxFiles: "6M",
  });

  const dailyCombined = new transports.DailyRotateFile({
    filename: "logs/combined-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "10m",
    maxFiles: "3M",
  });

  return createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: combine(timestamp(), errors({ stack: true })),
    defaultMeta: { service: "aspire-integration" },
    transports: [
      dailyError,
      dailyCombined,
      new transports.Console({
        format: combine(colorize(), timestamp(), consoleFormat),
        level: "info",
        handleExceptions: true,
        handleRejections: true,
      }),
    ],
    exceptionHandlers: [
      new transports.DailyRotateFile({
        filename: "logs/exceptions-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        maxSize: "10m",
        maxFiles: "6M",
        zippedArchive: true,
      }),
    ],
    rejectionHandlers: [
      new transports.DailyRotateFile({
        filename: "logs/rejections-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        maxSize: "10m",
        maxFiles: "6M",
        zippedArchive: true,
      }),
    ],
  });
};

// Select logger based on environment
let logger =
  process.env.NODE_ENV === "production"
    ? productionLogger()
    : developmentLogger();

export { logger };
