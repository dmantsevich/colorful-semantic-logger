const ColorfulSemanticLogger = require('./lib/Logger');

module.exports = {
  ...ColorfulSemanticLogger.LEVELS,
  ColorfulSemanticLogger,
  Logger: ColorfulSemanticLogger,
  LEVELS: ColorfulSemanticLogger.LEVELS,
  logger: new ColorfulSemanticLogger()
};