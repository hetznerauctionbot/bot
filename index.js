// include requirements
const telegraf = require('telegraf'),
      winston  = require('winston');

// configuration variables with default values
const loglevel = process.env.LOGLEVEL || 'info',
      telegram_key = process.env.TELEGRAM_KEY;

// initialize some components (bot, logger, etc.)
const bot = new telegraf(telegram_key);
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
              level: loglevel,
              handleExceptions: true,
              format: winston.format.combine(
                winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
                winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`+(info.splat!==undefined? `${info.splat}.` : '.'))
              )
            })
    ]
  });

// start the bot
bot.start((ctx) => ctx.reply('Welcome'));

// handle any incoming text
bot.on('text', (ctx) => {
  let cmd = ctx.update.message.text;
  let message = 'Trying to run a command? See /help for a list of all available commands.';

  switch (cmd) {
    case '/criteria':
    case '/cpu':
    case '/maxprice':
    case '/mincpu':
    case '/minhd':
    case '/minram':
    case '/ssd':
      message = 'Command not implemented yet. Try again later...';
      break;
  }

  return ctx.reply(message);
});

// start bot
logger.info('Starting bot instance');
bot.launch();
