// include requirements
const Telegraf           = require('telegraf'),
      TelegrafInlineMenu = require('telegraf-inline-menu'),
      TelegrafSession    = require('telegraf-session-local'),
      winston            = require('winston');

// configuration variables with default values
const loglevel        = process.env.LOGLEVEL || 'info',
      telegram_key    = process.env.TELEGRAM_KEY;
      default_filters = {
        "maxprice": "None",
        "cputype": "Any",
        "ssd": "I don't care",
        "minhd": "None",
        "minram": "None"
      };

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
    'values': ['None', '30', '40', '50', '60', '70', '80', '90', '100', '110', '120', '130', '140', '150', '200'],
    'menu': new TelegrafInlineMenu('Set the max. price (excl. VAT):'),
    'joinLastRow': false
  },
  {
    'name': 'minhd',
    'title': 'Min. HD',
    'values': ['None', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
    'menu': new TelegrafInlineMenu('Set the min. number of disks:'),
    'joinLastRow': true
  },
  {
    'name': 'minram',
    'title': 'Min. RAM',
    'values': ['None', '2', '4', '8', '12', '16', '24', '32', '48', '64', '96', '128', '256', '512', '768'],
    'menu': new TelegrafInlineMenu('Set the min. RAM size in GB:'),
    'joinLastRow': true
  },
  {
    'name': 'cputype',
    'title': 'CPU Type',
    'values': ['Any', 'Intel', 'AMD'],
    'menu': new TelegrafInlineMenu('Set the preferred CPU type:'),
    'joinLastRow': false
  },
  {
    'name': 'ssd',
    'title': 'SSD',
    'values': ['I don\'t care', 'Yes', 'No'],
    'menu': new TelegrafInlineMenu('Set your preference for SSD disks:'),
    'joinLastRow': true
  }
];

// settings submenu
const filtersMenu = new TelegrafInlineMenu('Set/View your search settings:');
filtersMenu.simpleButton('📄 View current filters', 'view-filters', {
  doFunc: ctx => {
    let message = 'This is your current filter configuration:\n';
    ctx.session.filters.forEach(filter => {
      //
    });
    ctx.reply(message);
  }
});
filters.forEach(item => {
  item.menu.select('set-'+item.name, item.values, {
    setFunc: (ctx, key) => {
      logger.debug(`${ctx.update.callback_query.from.username} sets ${item.name} => ${key}`);
      ctx.session.filters[item.name] = key;
    },
    isSetFunc: (ctx, key) => {
      try { return ctx.session.filters[item.name] === key; }
      catch (error) { 
        if (typeof ctx.session.filters === 'undefined') {
          ctx.session.filters = default_filters;
        }
        return false;
      }
    }
  });
  filtersMenu.submenu(item.title, item.name, item.menu, {joinLastRow: item.joinLastRow});
});

// main menu
const menu = new TelegrafInlineMenu('Main Menu');
menu.setCommand('start');
menu.submenu('🔧 Filters', 'filters', filtersMenu);
menu.simpleButton('🔍 Search now', 'search-now', {
  doFunc: ctx => {
    ctx.reply('Searching for servers...');
  },
  joinLastRow: true
});
menu.simpleButton('ℹ️ Help', 'help', {
  doFunc: ctx => {
    ctx.reply('This is a helper bot for [Hetzner Auction Servers channel](https://t.me/hetznerauctionservers).\n\nUse /start to show the main menu at any moment.\n\nUse the Settings menu to set your search preferences and you will get notified for new servers matching your criteria.\n\n*IMPORTANT:* This bot is under heavy development and the features won\'t probably work yet.\n\n', { parse_mode: 'Markdown', disable_web_page_preview: true });  }
});

// set bot options (session, menu, callbacks and catch errors)
bot.use((new TelegrafSession({ database: 'data/session.json' })).middleware());

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
