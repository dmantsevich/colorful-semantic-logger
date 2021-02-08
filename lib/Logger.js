const merge = require('lodash.merge');
const chalk = require('chalk');
const { ChalkLogger, INFO, DEBUG, VERBOSE, FATAL, ERROR, WARN } = require('@barusu/chalk-logger');

const defaultOptions = require('./options');
const { convertToLevel, colorByType, color, LOG_LEVEL } = require('./utils');

class ColorfulSemanticLogger extends ChalkLogger {

  constructor(prefix = 'ColorfulSemanticLogger', options = {}) {
    super(merge({
      name: prefix,
      colorful: true
    }, options), process.argv);

    this.options = merge({}, defaultOptions(), options);
  }

  debug(...args) {
    super.debug(...args);
    return this;
  }

  verbose(...args) {
    super.verbose(...args);
    return this;
  }

  log(level, msg, ...args) {
    const newLevel = convertToLevel(level);
    this._callLevel = newLevel;
    if (newLevel !== level) {
      level = this.formatMessage(level);
      if (typeof msg !== 'undefined' && args.length === 0) {
        super.log(newLevel, level, msg);
      } else if (typeof msg === 'undefined') {
        super.log(newLevel, level);
      } else {
        super.log(newLevel, level, msg, ...args);
      }
    } else {
      msg = this.formatMessage(msg);
      super.log(level, msg, ...args);
    }
    this._callLevel = null;
    return this;
  }

  info(...args) {
    super.info(...args);
    return this;
  }

  error(...args) {
    super.error(...args);
    return this;
  }

  warn(...args) {
    super.warn(...args);
    return this;
  }

  fatal(...args) {
    super.fatal(...args);
    return this;
  }

  // Helper to fast log between INFO & VERBOSE levels
  print(info, verbose = null) {
    if (info && verbose) {
      this.fullLogLevel ? this.verbose(verbose) : this.info(info);
    } else if (info) {
      this.info(info);
    } else if (verbose) {
      this.verbose(verbose);
    }
    return this;
  }

  throwError(...args) {
    this.error(...args);
    const error = this.removeTags(args[0]);
    throw new Error(error, ...args.slice(1));
  }

  throwFatal(...args) {
    this.fatal(...args);
    const fatalError = this.removeTags(args[0]);
    throw new Error(fatalError, ...args.slice(1));
  }

  removeTags(msg) {
    const tags = this.options.semanticData.tags || {};
    return (msg || '').replace(this.options.semanticTagPattern, (pattern, type, value) => {
      const tag = this.getTag(type, tags);
      return tag ? value : pattern;
    });
  }

  formatMessage(msg = '') {
    if (typeof msg === 'string') {
      return this.paintMsg(msg);
    }
    return colorByType(msg, this);
  }

  getTag(tag, tags) {
    if (tags[tag]) return tags[tag];
    if (typeof chalk[tag] === 'function') return chalk[tag];
    if (tag.indexOf('#') === 0) return chalk.hex(tag.toUpperCase());
    if (tag.indexOf('bg#') === 0) return chalk.bgHex(tag.toUpperCase().slice(2));
    if (tag.indexOf('.') !== -1) {
      return tag.split('.').reduce((m, fn) => m && m[fn] ? m[fn] : null, chalk);
    }
    return null;
  }

  paintMsg(msg) {
    const tags = this.options.semanticData.tags || {};
    const reservedWords = this.options.semanticData.reservedWords || [];
    msg = (msg || '').replace(
      this.options.semanticTagPattern,
      (pattern, type, value) => {
        const tag = this.getTag(type, tags);
        if (tag) {
          return this._paint(value, tag);
        }
        return pattern;
      }
    );

    msg = msg.replace(/(\w+)/g, (v) => {
      reservedWords.forEach((rw) => {
        if (rw.words.indexOf(v.toLowerCase()) !== -1) {
          v = this._paint(v, rw.color);
          return false;
        }
      });
      return v;
    });

    return msg;
  }

  formatHeader() {
    const headerFormat = (typeof this.options.headerFormat === 'function') ? this.options.headerFormat(this) : this.options.headerFormat;
    return this.processShortcodes(headerFormat || '');
  }

  processShortcodes(str) {
    const { shortCodes } = this.options;
    return str.replace(this.options.shortCodesPattern, (pattern, shortcode, value) => {
      const shortCode = shortCodes[shortcode];
      if (shortCode) {
        return this._paint(shortCode(this), shortCodes[`${shortcode}.color`])
      }
      return pattern;
    });
  }

  _paint(value, colorValue) {
    return this.flags.colorful ? color(value, colorValue, this) : value;
  }

  createNew(prefix, options) {
    const name = [prefix, this.name].join('.');
    options = merge({}, this.options, options);
    return new this.constructor(name, options);
  }
}

ColorfulSemanticLogger.LEVELS = {
  LOG: LOG_LEVEL,
  INFO, DEBUG, VERBOSE, FATAL, ERROR, WARN
};

module.exports = ColorfulSemanticLogger;