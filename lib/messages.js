const util = require('util');

const messages = {
  'ask_for_max_price': `
Please, enter your desired max price:
`,
  'command_not_found': `
Command %s not found. Please run /help to see the list of all available commands.
`, 
  'command_not_implemented': `
Command %s not implemented. Please try in a few days.
`,
  'help': `
Help message
`,
  'start': `
Welcome %s!
`
};

const botMessages = (key, vars) => {
  return util.format(message_list[key], vars);
};

module.exports = {
  botMessages
};
