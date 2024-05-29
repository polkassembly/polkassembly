const path = require('path');

module.exports = (on, config) => {
  on('before:browser:launch', (browser = {}, launchOptions) => {
    if (browser.name === 'chrome') {
      // Path to the downloaded Polkadot extension
      const extensionPath = path.join(__dirname, '..', 'extensions', 'polkadot-extension.crx');

      launchOptions.args.push(`--load-extension=${extensionPath}`);
    }

    return launchOptions;
  });
};
