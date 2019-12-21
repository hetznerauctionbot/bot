const winston = require('winston');

module.exports = function () {
  winston.add(
    new winston.transports.Console({
          level: process.env.LOGLEVEL || 'info',
          handleExceptions: true,
          format: winston.format.combine(
            winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
            winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`+(info.splat!==undefined? `${info.splat}.` : '.'))
          )
      })
  );
}
