const winston = require('winston');
require('colors');

// Logstash Transport (Optional - configured if host/port provided)
// Using a generic TCP transport pattern if specific package fails or for simplicity
// For now, we use Console and File. User requested Logstash, so we'll add the configuration placeholder
// or use the installed transport if available.

let transports = [
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
];

// Try to add Logstash transport if configured
if (process.env.LOGSTASH_HOST && process.env.LOGSTASH_PORT) {
    try {
        const LogstashTransport = require('winston-logstash-transport').LogstashTransport;
        transports.push(new LogstashTransport({
            host: process.env.LOGSTASH_HOST,
            port: process.env.LOGSTASH_PORT
        }));
        console.log(`Logstash transport configured for ${process.env.LOGSTASH_HOST}:${process.env.LOGSTASH_PORT}`.green);
    } catch (err) {
        console.warn('winston-logstash-transport not available, skipping Logstash'.yellow);
    }
}

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'sociosphere-backend' },
    transports: transports,
});

module.exports = logger;
