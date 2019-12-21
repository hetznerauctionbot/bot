// include requirements
const messages  = require('./lib/messages'),
      telegraf  = require('telegraf'),
      winston   = require('winston'),
      { start, help, setMaxPriceCmd } = require('./lib/botCommands');

// configuration variables with default values
const telegram_key = process.env.TELEGRAM_KEY;

// initialize some components (bot, winston, etc.)
const bot = new telegraf(telegram_key);
require('./lib/logging.js')();

// welcome users on /start
bot.start(start);
bot.help(help);
bot.command('maxprice', setMaxPriceCmd);

// handle any incoming text
bot.on('text', (ctx) => {
  let cmd = ctx.update.message.text;
  let message = messages.command_not_found;

  switch (cmd) {
    case '/criteria':
    case '/cpu':
    case '/mincpu':
    case '/minhd':
    case '/minram':
    case '/search':
    case '/ssd':
      message = messages.command_not_found;
      break;
  }

  return ctx.reply(message);
});

// start bot
winston.info('Starting bot instance');
bot.launch();
