// include requirements
const Telegraf           = require('telegraf'),
      TelegrafInlineMenu = require('telegraf-inline-menu'),
      TelegrafSession    = require('telegraf/session'),
      winston            = require('winston');

// configuration variables with default values
const loglevel     = process.env.LOGLEVEL || 'info',
      telegram_key = process.env.TELEGRAM_KEY;

// other variables
var options = {};

// initialize some components (bot, winston, etc.)
const bot = new Telegraf(telegram_key);
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

// search filters to create submenus
const filters = [
  {
    'name': 'maxprice',
    'title': 'Max. Price',
    'values': ['30', '40', '50', '60', '70', '80', '90', '100', '110', '120', '130', '140', '150', '200'],
    'menu': new TelegrafInlineMenu('Set the max. price (excl. VAT):')
  },
  {
    'name': 'cputype',
    'title': 'CPU Type',
    'values': ['Any', 'Intel', 'AMD'],
    'menu': new TelegrafInlineMenu('Set the preferred CPU type:')
  },
  {
    'name': 'ssd',
    'title': 'SSD',
    'values': ['Yes', 'No'],
    'menu': new TelegrafInlineMenu('Set your preference for SSD disks:')
  },
  {
    'name': 'minhd',
    'title': 'Min. HD',
    'values': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
    'menu': new TelegrafInlineMenu('Set the min. number of disks:')
  },
  {
    'name': 'minram',
    'title': 'Min. RAM',
    'values': ['2', '4', '8', '12', '16', '24', '32', '48', '64', '96', '128', '256', '512', '768'],
    'menu': new TelegrafInlineMenu('Set the min. RAM size in GB:')
  }

];

// settings submenu
const filtersMenu = new TelegrafInlineMenu('Set your search settings:');
filters.forEach(item => {
  item.menu.select(item.name, item.values, {
    setFunc: (ctx, key) => {
      logger.debug(`${ctx.update.callback_query.from.username} sets ${item.name} => ${key}`);
      options[item.name] = key;
    },
    isSetFunc: (ctx, key) => {
      return options[item.name] === key;
    }
  });
  filtersMenu.submenu(item.title, item.name, item.menu);
});

// main menu
const menu = new TelegrafInlineMenu('Main Menu');
menu.setCommand('start');
menu.submenu('🔧 Settings', 'filters', filtersMenu);

// set bot options (session, menu, callbacks and catch errors)
bot.use(TelegrafSession());

bot.use(menu.init({
  backButtonText: '⏪ Previous menu',
  mainMenuButtonText: '⏮️ Main menu'
}));

bot.use((ctx, next) => {
  if (ctx.callbackQuery) {
    logger.info(`Another callbackQuery happened ${ctx.callbackQuery.data.length} ${ctx.callbackQuery.data}`);
  }

  return next();
});

bot.catch(error => {
  logger.error(`Telegraf error ${error.response} ${error.parameters} ${error.on || error}`);
});

// main function
async function startup() {
  await bot.launch();
  logger.info(`Bot started as ${ bot.options.username }`);
}
startup();
