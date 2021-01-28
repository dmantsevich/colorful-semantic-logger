const chalk = require('chalk');
const path = require('path');
const { parseValue, colorByType } = require('./utils');

module.exports = () => ({
  semanticTagPattern: /<(.+?)>(.*?)<\/(.+?)>/gs,
  semanticData: {
    tags: {
      'red': 'red',
      'yellow': 'yellow',
      'green': 'green',
      'blue': 'blue',
      'number': (v, logger) => colorByType(v, logger, 'number'),
      'key': (v, logger) => chalk.cyanBright(`"${v}"`),
      'value': (v, logger) => {
        v = parseValue(v);
        return colorByType(v, logger);
      },
      '!': (v, logger) => chalk.bgGray.bold(` ${v} `),
      'path': (v, logger) => {
        return v
          .split(',')
          .map(value => {
            value = value.trim();
            if (logger.level.rank > 1) {
              value = path.relative(process.cwd(), value);
            }
            return chalk.magenta.underline(value);
          })
          .join(', ')
      }
    },
    reservedWords: [
      {
        words: ['success', 'successful', 'ok', 'done', 'fine', 'connected', 'resolved', 'cool'],
        color: (value) => chalk.green.underline(value)
      },
      {
        words: ['fail', 'error', 'errors', 'fatal', 'reject', 'rejected', 'issue', 'disconnect', 'disconnected', 'issue', 'bug', 'problem', 'problems', 'exception', 'exceptions', 'throw'],
        color: (value) => chalk.red.bold(value)
      }
    ]
  },

  shortCodesPattern: /<(.+?)\/>/gs,
  shortCodes: {
    'time.now': () => (new Date()).toLocaleTimeString(),
    'time.now.color': 'gray',

    'date.now': () => (new Date()).toLocaleDateString(),
    'date.now.color': 'gray',

    'loggerName': (logger) => logger.name,
    'loggerName.color': 'gray',

    'level': (logger) => logger._callLevel.desc.toUpperCase(),
    'level.color': (value, logger) => logger._callLevel.headerChalk.bg(logger._callLevel.headerChalk.fg(value))
  },
  headerFormat: '<time.now/> <level/> \t<loggerName/>\t: '
});