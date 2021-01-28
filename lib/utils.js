const chalk = require('chalk');

let noop = (v) => v;

exports.LOG_LEVEL = {
  rank: 3,
  desc: 'log',
  headerChalk: { fg: noop, bg: noop },
  contentChalk: { fg: noop, bg: noop }
}

exports.noop = noop;
exports.convertToLevel = (level) => {
  if (level && typeof level.rank === 'number' && typeof level.desc === 'string') {
    level.headerChalk.bg = level.headerChalk.bg || noop;
    level.headerChalk.fg = level.headerChalk.fg || noop;
    level.contentChalk.fg = level.contentChalk.fg || noop;
    level.contentChalk.bg = level.contentChalk.bg || noop;
    return level;
  }
  return exports.LOG_LEVEL;
}
exports.parseValue = (value) => {
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
}

exports.color = (value, color, logger) => {
  !color && (color = noop);
  if (chalk[color]) return chalk[color](value); // string
  if (typeof color === 'string' && color.indexOf('#') === 0) return chalk.hex(color)(value);
  if (typeof color === 'function') return color(value, logger); // as fn
  return value;
}

exports.colorByType = (v, logger, forceType = null) => {
  if (logger.flags.colorful) {
    if (forceType === 'null' || v === null || typeof v === 'undefined' || v === 'undefined') return chalk.hex('#FF8C00')(v);
    if (forceType === 'number' || typeof v === 'number') return chalk.blue(v);
    if (forceType === 'bool' || typeof v === 'boolean') return chalk.hex('#8A2BE2')(v);
    if (forceType === 'array' || Array.isArray(v)) {
      return '[' + v.map((v) => {
        return exports.colorByType(v, logger);
      }).join(', ') + ']';
    }
    return chalk.hex('#50fa7b')(`"${v}"`);
  }
  return v;
}