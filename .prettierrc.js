const spotifyPrettierConfig = require('@spotify/prettier-config');

module.exports = {
  ...spotifyPrettierConfig,
  endOfLine: 'auto',
  printWidth: 120,
};
