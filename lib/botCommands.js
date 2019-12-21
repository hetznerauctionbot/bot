const winston = require('winston'),
      messages = require('./messages');
require('./logging.js');

const startCmd = async ctx => {
  try {
    const chatId = ctx.from.id
    const firstName = ctx.from.first_name
    const lastName = ctx.from.last_name

    winston.info(`New /start command from ${firstName}`);
    //ctx.reply(messages.start)
    ctx.reply('Welcome!');
  } catch (error) {
    console.error(error)
    ctx.reply('ERROR')
  }
};

const helpCmd = ctx => {
  ctx.reply(messages.help)
};

const setMaxPriceCmd = async ctx => {
  ctx.reply(messages.ask_for_max_price);
};

module.exports = {
  startCmd,
  helpCmd,
  setMaxPriceCmd
}
