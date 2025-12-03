import winston from 'winston';
import path from 'path';

const logDir = 'logs';

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'meta-ads-scraper' },
    transports: [
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error'
        }),
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log')
        }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});